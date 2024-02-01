use std::collections::HashMap;

use prost_reflect::{DescriptorPool, DynamicMessage};
use serde_json::Deserializer;
use tokio::sync::mpsc;
use tokio_stream::StreamExt;
use tonic::transport::{Channel, Uri};
use tonic::{IntoRequest, Streaming};

use crate::codec::DynamicCodec;
use crate::proto::{fill_pool, method_desc_to_path};

type Result<T> = std::result::Result<T, String>;

#[derive(Clone)]
pub struct GrpcConnection {
    pool: DescriptorPool,
    conn: Channel,
}

impl GrpcConnection {
    pub async fn unary(&self, service: &str, method: &str, message: &str) -> Result<String> {
        let service = self.pool.get_service_by_name(service).unwrap();
        let method = &service.methods().find(|m| m.name() == method).unwrap();
        let input_message = method.input();

        let mut deserializer = Deserializer::from_str(message);
        let req_message = DynamicMessage::deserialize(input_message, &mut deserializer)
            .map_err(|e| e.to_string())?;
        deserializer.end().unwrap();

        let mut client = tonic::client::Grpc::new(self.conn.clone());

        println!(
            "\n---------- SENDING -----------------\n{}",
            serde_json::to_string_pretty(&req_message).expect("json")
        );

        let req = req_message.into_request();
        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.unwrap();

        let resp = client.unary(req, path, codec).await.unwrap();
        let msg = resp.into_inner();
        let response_json = serde_json::to_string_pretty(&msg).expect("json to string");
        println!("\n---------- RECEIVING ---------------\n{}", response_json,);

        Ok(response_json)
    }
    pub async fn server_streaming(
        &self,
        service: &str,
        method: &str,
        message: &str,
    ) -> Result<Streaming<DynamicMessage>> {
        let service = self.pool.get_service_by_name(service).unwrap();
        let method = &service.methods().find(|m| m.name() == method).unwrap();
        let input_message = method.input();

        let mut deserializer = Deserializer::from_str(message);
        let req_message = DynamicMessage::deserialize(input_message, &mut deserializer)
            .map_err(|e| e.to_string())?;
        deserializer.end().unwrap();

        let mut client = tonic::client::Grpc::new(self.conn.clone());

        println!(
            "\n---------- SENDING -----------------\n{}",
            serde_json::to_string_pretty(&req_message).expect("json")
        );

        let req = req_message.into_request();
        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.unwrap();

        Ok(client
            .server_streaming(req, path, codec)
            .await
            .map_err(|s| s.to_string())?
            .into_inner())
    }
}

pub struct GrpcManager {
    connections: HashMap<String, GrpcConnection>,
    pub send: mpsc::Sender<String>,
    pub recv: mpsc::Receiver<String>,
}

impl Default for GrpcManager {
    fn default() -> Self {
        let (send, recv) = mpsc::channel(100);
        let connections = HashMap::new();
        Self {
            connections,
            send,
            recv,
        }
    }
}

impl GrpcManager {
    pub async fn server_streaming(
        &mut self,
        id: &str,
        uri: Uri,
        service: &str,
        method: &str,
        message: &str,
    ) -> Result<Streaming<DynamicMessage>> {
        println!("Server streaming {}", id);
        self.connect(id, uri)
            .await
            .server_streaming(service, method, message)
            .await

        // while let Some(item) = stream.next().await {
        //     match item {
        //         Ok(item) => {
        //             let item = serde_json::to_string_pretty(&item).unwrap();
        //             println!("Sending message {}", item);
        //             self.send.send(item).await.unwrap()
        //         }
        //         Err(e) => println!("\terror: {}", e),
        //     }
        // }

        // Ok(())
    }

    pub async fn connect(&mut self, id: &str, uri: Uri) -> GrpcConnection {
        let (pool, conn) = fill_pool(&uri).await;
        let connection = GrpcConnection { pool, conn };
        self.connections.insert(id.to_string(), connection.clone());
        connection
    }
}
