use log::info;
use rand::distributions::{Alphanumeric, DistString};
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::mpsc::Receiver;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::{Request, Response, Status, Streaming};

use crate::error::Error::{NoPluginsErr, PluginNotFoundErr};
use crate::error::Result;
use crate::events::{BootRequest, BootResponse, InternalEvent, InternalEventPayload};
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntime;
use plugin_runtime::EventStreamEvent;
use yaak_models::queries::generate_id;

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
    boot_resp: Arc<Mutex<Option<BootResponse>>>,
}

impl PluginHandle {
    pub async fn name(&self) -> String {
        match &*self.boot_resp.lock().await {
            None => "__NOT_BOOTED__".to_string(),
            Some(r) => r.name.to_owned(),
        }
    }

    pub fn build_event_to_send(
        &self,
        payload: &InternalEventPayload,
        reply_id: Option<String>,
    ) -> InternalEvent {
        InternalEvent {
            id: gen_id(),
            plugin_ref_id: self.ref_id.clone(),
            reply_id,
            payload: payload.clone(),
        }
    }

    pub async fn send(&self, event: &InternalEvent) -> Result<()> {
        info!("Sending event {} {:?}", event.id, self.name().await);
        self.to_plugin_tx
            .lock()
            .await
            .send(Ok(EventStreamEvent {
                event: serde_json::to_string(&event)?,
            }))
            .await?;
        Ok(())
    }

    pub async fn boot(&self, resp: &BootResponse) {
        let mut boot_resp = self.boot_resp.lock().await;
        *boot_resp = Some(resp.clone());
    }
}

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

    pub async fn subscribe(&self) -> (String, Receiver<InternalEvent>) {
        let (tx, rx) = mpsc::channel(128);
        let id = generate_id();
        self.subscribers.lock().await.insert(id.clone(), tx);
        (id, rx)
    }

    pub async fn unsubscribe(&self, rx_id: String) {
        self.subscribers.lock().await.remove(rx_id.as_str());
    }

    pub async fn remove_plugins(&self, plugin_ids: Vec<String>) {
        for plugin_id in plugin_ids {
            self.remove_plugin(plugin_id.as_str()).await;
        }
    }

    pub async fn remove_plugin(&self, id: &str) {
        match self.plugin_ref_to_plugin.lock().await.remove(id) {
            None => {
                println!("Tried to remove non-existing plugin {}", id);
            }
            Some(plugin) => {
                println!("Removed plugin {} {}", id, plugin.name().await);
            }
        };
    }

    pub async fn boot_plugin(&self, id: &str, resp: &BootResponse) {
        match self.plugin_ref_to_plugin.lock().await.get(id) {
            None => {
                println!("Tried booting non-existing plugin {}", id);
            }
            Some(plugin) => {
                plugin.clone().boot(resp).await;
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
            boot_resp: Arc::new(Mutex::new(None)),
        };
        let _ = self
            .plugin_ref_to_plugin
            .lock()
            .await
            .insert(ref_id, plugin_handle.clone());
        plugin_handle
    }

    // pub async fn callback(
    //     &self,
    //     source_event: InternalEvent,
    //     payload: InternalEventPayload,
    // ) -> Result<InternalEvent> {
    //     let reply_id = match source_event.clone().reply_id {
    //         None => {
    //             let msg = format!("Source event missing reply Id {:?}", source_event.clone());
    //             return Err(MissingCallbackIdErr(msg));
    //         }
    //         Some(id) => id,
    //     };
    //
    //     let callbacks = self.callbacks.lock().await;
    //     let plugin_name = match callbacks.get(reply_id.as_str()) {
    //         None => {
    //             let msg = format!("Callback not found {:?}", source_event);
    //             return Err(MissingCallbackErr(msg));
    //         }
    //         Some(n) => n,
    //     };
    //
    //     let plugins = self.plugins.lock().await;
    //     let plugin = match plugins.get(plugin_name) {
    //         None => {
    //             let msg = format!(
    //                 "Plugin not found {plugin_name}. Choices were {:?}",
    //                 plugins.keys()
    //             );
    //             return Err(UnknownPluginErr(msg));
    //         }
    //         Some(n) => n,
    //     };
    //
    //     plugin.send(&payload, Some(reply_id)).await
    // }

    pub async fn plugin_by_name(&self, plugin_name: &str) -> Result<PluginHandle> {
        let plugins = self.plugin_ref_to_plugin.lock().await;
        if plugins.is_empty() {
            return Err(NoPluginsErr("Send failed because no plugins exist".into()));
        }

        for p in plugins.values() {
            if p.name().await == plugin_name {
                return Ok(p.to_owned());
            }
        }

        let msg = format!("Failed to find plugin for {plugin_name}");
        Err(PluginNotFoundErr(msg))
    }

    pub async fn send_to_plugin(
        &self,
        plugin_name: &str,
        payload: InternalEventPayload,
    ) -> Result<InternalEvent> {
        let plugins = self.plugin_ref_to_plugin.lock().await;
        if plugins.is_empty() {
            return Err(NoPluginsErr("Send failed because no plugins exist".into()));
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
            None => {
                let msg = format!("Failed to find plugin for {plugin_name}");
                Err(PluginNotFoundErr(msg))
            }
        }
    }

    pub async fn send_to_plugin_and_wait(&self, plugin_name: &str, payload: &InternalEventPayload) -> Result<InternalEvent> {
        let plugin = self.plugin_by_name(plugin_name).await?;
        let events = self.send_to_plugins_and_wait(payload, vec![plugin]).await?;
        Ok(events.first().unwrap().to_owned())
    }

    pub async fn send_and_wait(
        &self,
        payload: &InternalEventPayload,
    ) -> Result<Vec<InternalEvent>> {
        let plugins = self.plugin_ref_to_plugin.lock().await.values().cloned().collect();
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
                server.unsubscribe(rx_id).await;

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

    pub async fn send(&self, payload: InternalEventPayload) -> Result<Vec<InternalEvent>> {
        let mut events: Vec<InternalEvent> = Vec::new();
        let plugins = self.plugin_ref_to_plugin.lock().await;
        if plugins.is_empty() {
            return Err(NoPluginsErr("Send failed because no plugins exist".into()));
        }

        for ph in plugins.values() {
            let event = ph.build_event_to_send(&payload, None);
            self.send_to_plugin_handle(ph, &event).await?;
            events.push(event);
        }

        Ok(events)
    }

    async fn send_to_plugin_handle(
        &self,
        plugin: &PluginHandle,
        event: &InternalEvent,
    ) -> Result<()> {
        plugin.send(event).await
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
                                println!("Failed to send to server channel. Receiver probably isn't listening: {:?}", e);
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

fn gen_id() -> String {
    Alphanumeric.sample_string(&mut rand::thread_rng(), 5)
}
