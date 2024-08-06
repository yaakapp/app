use rand::distributions::{Alphanumeric, DistString};
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::{Request, Response, Status, Streaming};

use plugin_runtime::EventStreamEvent;

use crate::error::Error::{MissingCallbackErr, MissingCallbackIdErr, UnknownPluginErr};
use crate::error::Result;
use crate::events::{PluginBootRequest, PluginBootResponse, PluginEvent, PluginEventPayload};
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntime;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

type ResponseStream =
    Pin<Box<dyn Stream<Item = std::result::Result<EventStreamEvent, Status>> + Send>>;

#[derive(Clone)]
pub struct PluginHandle {
    dir: String,
    to_plugin_tx: Arc<Mutex<mpsc::Sender<tonic::Result<EventStreamEvent>>>>,
    ref_id: String,
    boot_resp: Option<PluginBootResponse>,
}

impl PluginHandle {
    pub async fn send_event(
        &self,
        payload: &PluginEventPayload,
        reply_id: Option<String>,
    ) -> Result<()> {
        let event = PluginEvent {
            plugin_dir: self.dir.clone(),
            reply_id,
            payload: payload.clone(),
        };
        println!("Sending event to plugin {} {:?}", self.dir, event.payload);
        self.to_plugin_tx
            .lock()
            .await
            .send(Ok(EventStreamEvent {
                event: serde_json::to_string(&event)?,
            }))
            .await?;
        Ok(())
    }

    pub fn boot(&mut self, resp: PluginBootResponse) {
        self.boot_resp = Some(resp.clone());
    }
}

#[derive(Clone)]
pub struct GrpcServer {
    /// All plugins that have booted
    plugins: Arc<Mutex<HashMap<String, PluginHandle>>>,
    // Callbacks is a map of callback_id -> plugin_name
    callbacks: Arc<Mutex<HashMap<String, String>>>,
    /// Send here to send emit an event to the server
    to_server_tx: Arc<Mutex<mpsc::Sender<(PluginEvent, PluginHandle)>>>,
    reply_count: Arc<Mutex<u32>>,
}

impl GrpcServer {
    pub async fn remove_plugin(&self, id: &str) {
        match self.plugins.lock().await.remove(id) {
            None => {
                println!("Tried to remove non-existing plugin {}", id);
            }
            Some(_) => {
                println!("Remove plugin {}", id);
            }
        };
    }

    pub async fn add_plugin(
        &self,
        dir: &str,
        tx: mpsc::Sender<tonic::Result<EventStreamEvent>>,
    ) -> PluginHandle {
        let ref_id = Alphanumeric.sample_string(&mut rand::thread_rng(), 10);
        let plugin_handle = PluginHandle {
            ref_id: ref_id.clone(),
            dir: dir.to_string(),
            to_plugin_tx: Arc::new(Mutex::new(tx)),
            boot_resp: None,
        };
        let _ = self
            .plugins
            .lock()
            .await
            .insert(ref_id, plugin_handle.clone());
        plugin_handle
    }
}

impl GrpcServer {
    pub fn new(tx: mpsc::Sender<(PluginEvent, PluginHandle)>) -> Self {
        GrpcServer {
            plugins: Arc::new(Mutex::new(HashMap::new())),
            callbacks: Arc::new(Mutex::new(HashMap::new())),
            to_server_tx: Arc::new(Mutex::new(tx)),
            reply_count: Arc::new(Mutex::new(0)),
        }
    }

    pub async fn callback(
        &self,
        source_event: PluginEvent,
        payload: PluginEventPayload,
    ) -> Result<()> {
        let reply_id = match source_event.clone().reply_id {
            None => {
                let msg = format!("Source event missing reply Id {:?}", source_event.clone());
                return Err(MissingCallbackIdErr(msg));
            }
            Some(id) => id,
        };

        let callbacks = self.callbacks.lock().await;
        let plugin_name = match callbacks.get(reply_id.as_str()) {
            None => {
                let msg = format!("Callback not found {:?}", source_event);
                return Err(MissingCallbackErr(msg));
            }
            Some(n) => n,
        };

        let plugins = self.plugins.lock().await;
        let plugin = match plugins.get(plugin_name) {
            None => {
                let msg = format!(
                    "Plugin not found {plugin_name}. Choices were {:?}",
                    plugins.keys()
                );
                return Err(UnknownPluginErr(msg));
            }
            Some(n) => n,
        };

        plugin.send_event(&payload, Some(reply_id)).await
    }

    pub async fn send(&self, payload: PluginEventPayload) -> Result<()> {
        for ph in self.plugins.lock().await.values() {
            self.send_to_plugin_handle(ph, &payload, None).await?;
        }

        Ok(())
    }

    pub async fn send_for_reply(&self, payload: PluginEventPayload) -> Result<()> {
        for ph in self.plugins.lock().await.values() {
            let mut reply_count = self.reply_count.lock().await;
            *reply_count += 1;
            self.send_to_plugin_handle(ph, &payload, Some(reply_count.to_string()))
                .await?;
        }

        Ok(())
    }

    async fn send_to_plugin_handle(
        &self,
        plugin: &PluginHandle,
        payload: &PluginEventPayload,
        reply_id: Option<String>,
    ) -> Result<()> {
        plugin.send_event(payload, reply_id).await
    }
}

#[tonic::async_trait]
impl PluginRuntime for GrpcServer {
    type EventStreamStream = ResponseStream;

    async fn event_stream(
        &self,
        req: Request<Streaming<EventStreamEvent>>,
    ) -> tonic::Result<Response<Self::EventStreamStream>> {
        let mut in_stream = req.into_inner();

        let (to_plugin_tx, to_plugin_rx) = mpsc::channel(128);
        let to_server_tx = Arc::clone(&self.to_server_tx);

        let dir = "/Users/gschier/Workspace/plugins/plugins/exporter-curl";
        let plugin = self.add_plugin(dir, to_plugin_tx).await;

        if let Err(e) = self
            .send_for_reply(PluginEventPayload::BootRequest(PluginBootRequest {
                dir: dir.to_string(),
            }))
            .await
        {
            println!("Failed to send to {}: {}", plugin.ref_id, e)
        } else {
            println!("Send to {}", plugin.ref_id)
        }

        let callbacks = self.callbacks.clone();
        let server = self.clone();
        tokio::spawn(async move {
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => {
                        let event: PluginEvent = serde_json::from_str(v.event.as_str()).unwrap();
                        println!("Received event {:?}", event.payload);
                        to_server_tx
                            .lock()
                            .await
                            .send((event.clone(), plugin.clone()))
                            .await
                            .unwrap();
                        if let Some(reply_id) = event.reply_id {
                            callbacks
                                .lock()
                                .await
                                .insert(reply_id, plugin.ref_id.clone());
                        }
                    }
                    Err(err) => {
                        // TODO: Better error handling
                        println!("gRPC server error {err}");
                        break;
                    }
                };
            }
            server.remove_plugin(plugin.ref_id.as_str()).await;
        });

        // echo just write the same data that was received
        let out_stream = ReceiverStream::new(to_plugin_rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::EventStreamStream
        ))
    }
}
