use std::pin::Pin;
use log::warn;
use tokio::sync::mpsc;
use tonic::{Request, Response, Status, Streaming};
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use crate::server::plugin_runtime::PluginEvent;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntime;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

type ResponseStream = Pin<Box<dyn Stream<Item = Result<PluginEvent, Status>> + Send>>;

#[derive(Debug)]
pub struct GrpcServer {}

#[tonic::async_trait]
impl PluginRuntime for GrpcServer {
    type EventStreamStream = ResponseStream;

    async fn event_stream(
        &self,
        req: Request<Streaming<PluginEvent>>,
    ) -> Result<Response<Self::EventStreamStream>, Status> {
        let mut in_stream = req.into_inner();
        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {
            tx.send(Ok(PluginEvent {
                name: "plugin.boot.request".to_string(),
                reply_id: "reply.123".to_string(),
                payload: r#"{"dir": "/Users/gschier/Workspace/plugins/plugins/exporter-curl"}"#.to_string(),
            }))
                .await
                .unwrap();
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => {
                        match v.name.as_str() {
                            "ping" => {
                                tx.send(Ok(PluginEvent {
                                    name: "pong".to_string(),
                                    reply_id: "".to_string(),
                                    payload: "{}".to_string(),
                                }))
                                    .await
                                    .unwrap();
                            },
                            _ => {
                                println!("Received event {v:?}")
                            }
                        };
                    }
                    Err(err) => {
                        // TODO: Better error handling
                        println!("gRPC server error {err}");
                        break
                    }
                }
            }
            println!("Stream ended");
        });

        // echo just write the same data that was received
        let out_stream = ReceiverStream::new(rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::EventStreamStream
        ))
    }
}
