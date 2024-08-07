use log::info;
use rand::distributions::{Alphanumeric, DistString};
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::{Request, Response, Status, Streaming};

use plugin_runtime::EventStreamEvent;

use crate::error::Error::{
    MissingCallbackErr, MissingCallbackIdErr, NoPluginsErr, UnknownPluginErr,
};
use crate::error::Result;
use crate::events::{BootRequest, BootResponse, InternalEvent, InternalEventPayload};
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
    boot_resp: Option<BootResponse>,
}

impl PluginHandle {
    pub async fn send(
        &self,
        payload: &InternalEventPayload,
        reply_id: Option<String>,
    ) -> Result<InternalEvent> {
        let event = InternalEvent {
            id: gen_id(),
            plugin_ref_id: self.ref_id.clone(),
            reply_id,
            payload: payload.clone(),
        };
        info!("Sending event {}\n  └─ {:?}", self.ref_id, event);
        self.to_plugin_tx
            .lock()
            .await
            .send(Ok(EventStreamEvent {
                event: serde_json::to_string(&event)?,
            }))
            .await?;
        Ok(event)
    }

    pub async fn send_for_reply(&self, payload: &InternalEventPayload) -> Result<()> {
        let event = InternalEvent {
            id: gen_id(),
            plugin_ref_id: self.ref_id.clone(),
            reply_id: Some(gen_id()),
            payload: payload.clone(),
        };
        info!("Sending event {}\n  └─ {:?}", self.ref_id, event);
        self.to_plugin_tx
            .lock()
            .await
            .send(Ok(EventStreamEvent {
                event: serde_json::to_string(&event)?,
            }))
            .await?;
        Ok(())
    }

    pub fn boot(&mut self, resp: &BootResponse) {
        self.boot_resp = Some(resp.clone());
    }
}

#[derive(Clone)]
pub struct PluginRuntimeGrpcServer {
    /// All plugins that have booted
    plugins: Arc<Mutex<HashMap<String, PluginHandle>>>,
    // Callbacks is a map of callback_id -> plugin_name
    callbacks: Arc<Mutex<HashMap<String, String>>>,

    to_server_tx: Arc<Mutex<mpsc::Sender<InternalEvent>>>,
    plugin_dirs: Vec<String>,
}

impl PluginRuntimeGrpcServer {
    pub async fn remove_plugins(&self, plugin_ids: Vec<String>) {
        for plugin_id in plugin_ids {
            self.remove_plugin(plugin_id.as_str()).await;
        }
    }

    pub async fn remove_plugin(&self, id: &str) {
        match self.plugins.lock().await.remove(id) {
            None => {
                println!("Tried to remove non-existing plugin {}", id);
            }
            Some(plugin) => {
                println!("Removed plugin {} {:?}", id, plugin.boot_resp);
            }
        };
    }

    pub async fn boot_plugin(&self, id: &str, resp: &BootResponse) {
        match self.plugins.lock().await.get(id) {
            None => {
                println!("Tried booting non-existing plugin {}", id);
            }
            Some(plugin) => {
                plugin.clone().boot(resp);
            }
        }
    }

    pub async fn add_plugin(
        &self,
        dir: &str,
        tx: mpsc::Sender<tonic::Result<EventStreamEvent>>,
    ) -> PluginHandle {
        let ref_id = gen_id();
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

impl PluginRuntimeGrpcServer {
    pub fn new(tx: mpsc::Sender<InternalEvent>, plugin_dirs: Vec<String>) -> Self {
        PluginRuntimeGrpcServer {
            plugins: Arc::new(Mutex::new(HashMap::new())),
            callbacks: Arc::new(Mutex::new(HashMap::new())),
            to_server_tx: Arc::new(Mutex::new(tx)),
            plugin_dirs,
        }
    }

    pub async fn callback(
        &self,
        source_event: InternalEvent,
        payload: InternalEventPayload,
    ) -> Result<InternalEvent> {
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

        plugin.send(&payload, Some(reply_id)).await
    }

    pub async fn send(&self, payload: InternalEventPayload) -> Result<Vec<InternalEvent>> {
        let mut events: Vec<InternalEvent> = Vec::new();
        for ph in self.plugins.lock().await.values() {
            events.push(self.send_to_plugin_handle(ph, &payload, None).await?);
        }

        Ok(events)
    }

    pub async fn send_for_reply(
        &self,
        payload: InternalEventPayload,
    ) -> Result<Vec<InternalEvent>> {
        let mut events: Vec<InternalEvent> = Vec::new();
        let plugins = self.plugins.lock().await;
        if plugins.is_empty() {
            return Err(NoPluginsErr("Send failed because no plugins exist".into()));
        }
        println!("PLUGINS {}", plugins.len());
        for ph in plugins.values() {
            let reply_id = gen_id();
            events.push(
                self.send_to_plugin_handle(ph, &payload, Some(reply_id))
                    .await?,
            );
        }

        Ok(events)
    }

    async fn send_to_plugin_handle(
        &self,
        plugin: &PluginHandle,
        payload: &InternalEventPayload,
        reply_id: Option<String>,
    ) -> Result<InternalEvent> {
        plugin.send(payload, reply_id).await
    }

    async fn load_plugins(
        &self,
        to_plugin_tx: mpsc::Sender<tonic::Result<EventStreamEvent>>,
        plugin_dirs: Vec<String>,
    ) -> Vec<String> {
        let mut plugin_ids = Vec::new();

        for dir in plugin_dirs {
            let plugin = self.add_plugin(dir.as_str(), to_plugin_tx.clone()).await;
            plugin_ids.push(plugin.clone().ref_id);

            if let Err(e) = plugin
                .send_for_reply(&InternalEventPayload::BootRequest(BootRequest {
                    dir: dir.to_string(),
                }))
                .await
            {
                // TODO: Error handling
                println!(
                    "Failed boot plugin {} at {} -> {}",
                    plugin.ref_id, plugin.dir, e
                )
            } else {
                println!("Loaded plugin {} at {}", plugin.ref_id, plugin.dir)
            }
        }

        plugin_ids
    }
}

#[tonic::async_trait]
impl PluginRuntime for PluginRuntimeGrpcServer {
    type EventStreamStream = ResponseStream;

    async fn event_stream(
        &self,
        req: Request<Streaming<EventStreamEvent>>,
    ) -> tonic::Result<Response<Self::EventStreamStream>> {
        let mut in_stream = req.into_inner();

        let (to_plugin_tx, to_plugin_rx) = mpsc::channel(128);
        let to_server_tx = Arc::clone(&self.to_server_tx);

        let plugin_ids = self
            .load_plugins(to_plugin_tx, self.plugin_dirs.clone())
            .await;

        let callbacks = self.callbacks.clone();
        let server = self.clone();
        tokio::spawn(async move {
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => {
                        let event: InternalEvent = match serde_json::from_str(v.event.as_str()) {
                            Ok(pe) => pe,
                            Err(e) => {
                                println!("Failed to deserialize event {e:?} -> {}", v.event);
                                continue;
                            }
                        };

                        let plugin_ref_id = event.plugin_ref_id.clone();
                        let reply_id = event.reply_id.clone();

                        // Emit event to the channel for server to handle
                        if let Err(e) = to_server_tx.lock().await.send(event).await {
                            println!("ERROR {:?}", e);
                        }

                        // Add to callbacks if there's a reply_id
                        if let Some(reply_id) = reply_id {
                            callbacks.lock().await.insert(reply_id, plugin_ref_id);
                        }
                    }
                    Err(err) => {
                        // TODO: Better error handling
                        println!("gRPC server error {err}");
                        break;
                    }
                };
            }

            server.remove_plugins(plugin_ids).await;
        });

        // Write the same data that was received
        let out_stream = ReceiverStream::new(to_plugin_rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::EventStreamStream
        ))
    }
}

fn gen_id() -> String {
    Alphanumeric.sample_string(&mut rand::thread_rng(), 5)
}
