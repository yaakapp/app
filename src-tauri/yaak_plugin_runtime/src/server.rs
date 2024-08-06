use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntime;
use crate::server::plugin_runtime::PluginEvent;
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::{Request, Response, Status, Streaming};
use crate::events::PluginBootRequest;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

type ResponseStream = Pin<Box<dyn Stream<Item = Result<PluginEvent, Status>> + Send>>;

#[derive(Clone)]
pub struct PluginHandle {
    pub to_plugin_tx: Arc<Mutex<mpsc::Sender<tonic::Result<PluginEvent>>>>,
}

#[derive(Clone)]
pub struct GrpcServer {
    pub plugins: Arc<Mutex<HashMap<String, PluginHandle>>>,
    pub tx: Arc<Mutex<mpsc::Sender<tonic::Result<PluginEvent>>>>,
}

impl GrpcServer {
    pub async fn foo(&mut self) {
        for (key, plugin) in self.plugins.lock().await.iter() {
            println!("PLUGIN {key}");
            plugin
                .to_plugin_tx
                .lock()
                .await
                .send(Ok(PluginEvent {
                    name: "name".to_string(),
                    reply_id: "".to_string(),
                    payload: "{}".to_string(),
                }))
                .await
                .unwrap()
        }
    }
}

#[tonic::async_trait]
impl PluginRuntime for GrpcServer {
    type EventStreamStream = ResponseStream;

    async fn event_stream(
        &self,
        req: Request<Streaming<PluginEvent>>,
    ) -> Result<Response<Self::EventStreamStream>, Status> {
        let mut in_stream = req.into_inner();

        let (to_plugin_tx, to_plugin_rx) = mpsc::channel(128);

        let ph = PluginHandle {
            to_plugin_tx: Arc::new(Mutex::new(to_plugin_tx)),
        };

        self.plugins
            .lock()
            .await
            .insert("default".into(), ph.clone());
        let to_server_tx = Arc::clone(&self.tx);

        // TODO: Remove this test request
        ph.to_plugin_tx
            .lock()
            .await
            .send(Ok(PluginEvent {
                name: "plugin.boot.request".to_string(),
                reply_id: "reply.123".to_string(),
                payload: serde_json::to_string(&PluginBootRequest {
                    dir: "/Users/gschier/Workspace/plugins/plugins/exporter-curl".to_string(),
                })
                .unwrap(),
            }))
            .await
            .unwrap();

        tokio::spawn(async move {
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => match v.name.as_str() {
                        "plugin.boot.response" => {
                            println!("GOT PLUGIN BOOT RESPONSE {:?}", v.payload);
                        }
                        _ => {
                            to_server_tx.lock().await.send(Ok(v)).await.unwrap();
                        }
                    },
                    Err(err) => {
                        // TODO: Better error handling
                        println!("gRPC server error {err}");
                        break;
                    }
                }
            }
            println!("Stream ended");
        });

        // echo just write the same data that was received
        let out_stream = ReceiverStream::new(to_plugin_rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::EventStreamStream
        ))
    }
}
