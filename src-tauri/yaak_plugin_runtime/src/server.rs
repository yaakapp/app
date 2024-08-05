use std::pin::Pin;

use tokio::sync::mpsc;
use tonic::{Request, Response, Status, Streaming};
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use crate::server::plugin_runtime::Event;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntime;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

type ResponseStream = Pin<Box<dyn Stream<Item = Result<Event, Status>> + Send>>;

#[derive(Debug)]
pub struct GrpcServer {}

#[tonic::async_trait]
impl PluginRuntime for GrpcServer {
    type EventStreamStream = ResponseStream;

    async fn event_stream(
        &self,
        req: Request<Streaming<Event>>,
    ) -> Result<Response<Self::EventStreamStream>, Status> {
        let mut in_stream = req.into_inner();
        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => {
                        println!("RUST GOT EVENT {v:?}");
                        tx.send(Ok(Event {
                            name: "pong".to_string(),
                            reply_id: "".to_string(),
                            payload: "null".to_string(),
                        }))
                        .await
                        .unwrap();
                    }
                    Err(_err) => {
                        todo!()
                    }
                }
            }
            println!("\tstream ended");
        });

        // echo just write the same data that was received
        let out_stream = ReceiverStream::new(rx);

        Ok(Response::new(
            Box::pin(out_stream) as Self::EventStreamStream
        ))
    }
}
