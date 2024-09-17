use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use log::warn;
use tokio::sync::mpsc::Receiver;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::{Request, Response, Status, Streaming};

use crate::error::Error::PluginNotFoundErr;
use crate::error::Result;
use crate::events::{InternalEvent, InternalEventPayload, BootRequest, BootResponse};
use crate::handle::PluginHandle;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntime;
use crate::util::gen_id;
use plugin_runtime::EventStreamEvent;
use yaak_models::queries::generate_id;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

type ResponseStream =
    Pin<Box<dyn Stream<Item = std::result::Result<EventStreamEvent, Status>> + Send>>;

#[derive(Clone)]
pub struct PluginRuntimeGrpcServer {
    plugin_ref_to_plugin: Arc<Mutex<HashMap<String, PluginHandle>>>,
    callback_to_plugin_ref: Arc<Mutex<HashMap<String, String>>>,
    subscribers: Arc<Mutex<HashMap<String, mpsc::Sender<InternalEvent>>>>,
    plugin_dirs: Vec<String>,
}

impl PluginRuntimeGrpcServer {
    pub fn new(plugin_dirs: Vec<String>) -> Self {
        PluginRuntimeGrpcServer {
            plugin_ref_to_plugin: Arc::new(Mutex::new(HashMap::new())),
            callback_to_plugin_ref: Arc::new(Mutex::new(HashMap::new())),
            subscribers: Arc::new(Mutex::new(HashMap::new())),
            plugin_dirs,
        }
    }

    pub async fn plugins(&self) -> Vec<PluginHandle> {
        self.plugin_ref_to_plugin
            .lock()
            .await
            .iter()
            .map(|p| p.1.to_owned())
            .collect::<Vec<PluginHandle>>()
    }

    pub async fn subscribe(&self) -> (String, Receiver<InternalEvent>) {
        let (tx, rx) = mpsc::channel(128);
        let rx_id = generate_id();
        self.subscribers.lock().await.insert(rx_id.clone(), tx);
        (rx_id, rx)
    }

    pub async fn unsubscribe(&self, rx_id: &str) {
        self.subscribers.lock().await.remove(rx_id);
    }

    pub async fn remove_plugins(&self, plugin_ids: Vec<String>) {
        for plugin_id in plugin_ids {
            self.remove_plugin(plugin_id.as_str()).await;
        }
    }

    pub async fn remove_plugin(&self, id: &str) {
        match self.plugin_ref_to_plugin.lock().await.remove(id) {
            None => println!("Tried to remove non-existing plugin {}", id),
            Some(plugin) => println!("Removed plugin {} {}", id, plugin.name().await),
        };
    }

    pub async fn boot_plugin(&self, id: &str, resp: &BootResponse) {
        match self.plugin_ref_to_plugin.lock().await.get(id) {
            None => println!("Tried booting non-existing plugin {}", id),
            Some(plugin) => plugin.clone().boot(resp).await,
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
            boot_resp: Arc::new(Mutex::new(None)),
        };
        let _ = self
            .plugin_ref_to_plugin
            .lock()
            .await
            .insert(ref_id, plugin_handle.clone());
        plugin_handle
    }

    pub async fn plugin_by_ref_id(&self, ref_id: &str) -> Result<PluginHandle> {
        let plugins = self.plugin_ref_to_plugin.lock().await;
        match plugins.get(ref_id) {
            None => Err(PluginNotFoundErr(ref_id.into())),
            Some(p) => Ok(p.to_owned()),
        }
    }

    pub async fn plugin_by_dir(&self, dir: &str) -> Result<PluginHandle> {
        let plugins = self.plugin_ref_to_plugin.lock().await;
        for p in plugins.values() {
            if p.dir == dir {
                return Ok(p.to_owned());
            }
        }

        Err(PluginNotFoundErr(dir.into()))
    }

    pub async fn plugin_by_name(&self, plugin_name: &str) -> Result<PluginHandle> {
        let plugins = self.plugin_ref_to_plugin.lock().await;
        for p in plugins.values() {
            if p.name().await == plugin_name {
                return Ok(p.to_owned());
            }
        }

        Err(PluginNotFoundErr(plugin_name.into()))
    }

    pub async fn send(
        &self,
        payload: &InternalEventPayload,
        plugin_ref_id: &str,
        reply_id: Option<String>,
    ) -> Result<()> {
        let plugin = self.plugin_by_ref_id(plugin_ref_id).await?;
        let event = plugin.build_event_to_send(payload, reply_id);
        plugin.send(&event).await
    }

    pub async fn send_to_plugin(
        &self,
        plugin_name: &str,
        payload: InternalEventPayload,
    ) -> Result<InternalEvent> {
        let plugins = self.plugin_ref_to_plugin.lock().await;
        if plugins.is_empty() {
            return Err(PluginNotFoundErr(plugin_name.into()));
        }

        let mut plugin = None;
        for p in plugins.values() {
            if p.name().await == plugin_name {
                plugin = Some(p);
                break;
            }
        }

        match plugin {
            Some(plugin) => {
                let event = plugin.build_event_to_send(&payload, None);
                plugin.send(&event).await?;
                Ok(event)
            }
            None => Err(PluginNotFoundErr(plugin_name.into())),
        }
    }

    pub async fn send_to_plugin_and_wait(
        &self,
        plugin_name: &str,
        payload: &InternalEventPayload,
    ) -> Result<InternalEvent> {
        let plugin = self.plugin_by_name(plugin_name).await?;
        let events = self.send_to_plugins_and_wait(payload, vec![plugin]).await?;
        Ok(events.first().unwrap().to_owned())
    }

    pub async fn send_and_wait(
        &self,
        payload: &InternalEventPayload,
    ) -> Result<Vec<InternalEvent>> {
        let plugins = self
            .plugin_ref_to_plugin
            .lock()
            .await
            .values()
            .cloned()
            .collect();
        self.send_to_plugins_and_wait(payload, plugins).await
    }

    async fn send_to_plugins_and_wait(
        &self,
        payload: &InternalEventPayload,
        plugins: Vec<PluginHandle>,
    ) -> Result<Vec<InternalEvent>> {
        // 1. Build the events with IDs and everything
        let events_to_send = plugins
            .iter()
            .map(|p| p.build_event_to_send(payload, None))
            .collect::<Vec<InternalEvent>>();

        // 2. Spawn thread to subscribe to incoming events and check reply ids
        let server = self.clone();
        let send_events_fut = {
            let events_to_send = events_to_send.clone();
            tokio::spawn(async move {
                let (rx_id, mut rx) = server.subscribe().await;
                let mut found_events = Vec::new();

                while let Some(event) = rx.recv().await {
                    if events_to_send
                        .iter()
                        .find(|e| Some(e.id.to_owned()) == event.reply_id)
                        .is_some()
                    {
                        found_events.push(event.clone());
                    };
                    if found_events.len() == events_to_send.len() {
                        break;
                    }
                }
                server.unsubscribe(rx_id.as_str()).await;

                found_events
            })
        };

        // 3. Send the events
        for event in events_to_send {
            let plugin = plugins
                .iter()
                .find(|p| p.ref_id == event.plugin_ref_id)
                .expect("Didn't find plugin in list");
            plugin.send(&event).await?
        }

        // 4. Join on the spawned thread
        let events = send_events_fut.await.expect("Thread didn't succeed");
        Ok(events)
    }

    pub async fn reload_plugins(&self) {
        for (_, plugin) in self.plugin_ref_to_plugin.lock().await.clone() {
            if let Err(e) = plugin.reload().await {
                warn!("Failed to reload plugin {} {}", plugin.dir, e)
            }
        }
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

            let event = plugin.build_event_to_send(
                &InternalEventPayload::BootRequest(BootRequest {
                    dir: dir.to_string(),
                }),
                None,
            );
            if let Err(e) = plugin.send(&event).await {
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

        let plugin_ids = self
            .load_plugins(to_plugin_tx, self.plugin_dirs.clone())
            .await;

        let callbacks = self.callback_to_plugin_ref.clone();
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

                        let subscribers = server.subscribers.lock().await;
                        for tx in subscribers.values() {
                            // Emit event to the channel for server to handle
                            if let Err(e) = tx.try_send(event.clone()) {
                                println!("Failed to send to server channel (n={}). Receiver probably isn't listening: {:?}", subscribers.len(), e);
                            }
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
