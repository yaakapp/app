use std::collections::HashMap;

use hyper::client::connect::Connect;
use hyper::client::HttpConnector;
use hyper::Client;
use hyper_rustls::HttpsConnector;
use prost_reflect::DescriptorPool;
pub use prost_reflect::DynamicMessage;
use serde_json::Deserializer;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;
use tonic::body::BoxBody;
use tonic::transport::Uri;
use tonic::{IntoRequest, IntoStreamingRequest, Streaming};

use crate::codec::DynamicCodec;
use crate::proto::{fill_pool, method_desc_to_path};

type Result<T> = std::result::Result<T, String>;

#[derive(Clone)]
pub struct GrpcConnection {
    pool: DescriptorPool,
    conn: Client<HttpsConnector<HttpConnector>, BoxBody>,
    pub uri: Uri,
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

        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

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

    pub async fn streaming(
        &self,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
    ) -> Result<Streaming<DynamicMessage>> {
        let service = self.pool.get_service_by_name(service).unwrap();
        let method = &service.methods().find(|m| m.name() == method).unwrap();

        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

        let method2 = method.clone();
        let req = stream
            .map(move |s| {
                let mut deserializer = Deserializer::from_str(&s);
                let req_message = DynamicMessage::deserialize(method2.input(), &mut deserializer)
                    .map_err(|e| e.to_string())
                    .unwrap();
                deserializer.end().unwrap();
                req_message
            })
            .into_streaming_request();
        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.unwrap();
        Ok(client
            .streaming(req, path, codec)
            .await
            .map_err(|s| s.to_string())?
            .into_inner())
    }

    pub async fn client_streaming(
        &self,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
    ) -> Result<DynamicMessage> {
        let service = self.pool.get_service_by_name(service).unwrap();
        let method = &service.methods().find(|m| m.name() == method).unwrap();
        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

        let req = {
            let method = method.clone();
            stream
                .map(move |s| {
                    let mut deserializer = Deserializer::from_str(&s);
                    let req_message =
                        DynamicMessage::deserialize(method.input(), &mut deserializer)
                            .map_err(|e| e.to_string())
                            .unwrap();
                    deserializer.end().unwrap();
                    req_message
                })
                .into_streaming_request()
        };
        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.unwrap();
        Ok(client
            .client_streaming(req, path, codec)
            .await
            .map_err(|s| s.to_string())?
            .into_inner())
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

        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

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
    }

    pub async fn client_streaming(
        &mut self,
        id: &str,
        uri: Uri,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
    ) -> Result<DynamicMessage> {
        self.connect(id, uri)
            .await
            .client_streaming(service, method, stream)
            .await
    }

    pub async fn streaming(
        &mut self,
        id: &str,
        uri: Uri,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
    ) -> Result<Streaming<DynamicMessage>> {
        self.connect(id, uri)
            .await
            .streaming(service, method, stream)
            .await
    }

    pub async fn connect(&mut self, id: &str, uri: Uri) -> GrpcConnection {
        let (pool, conn) = fill_pool(&uri).await;
        let connection = GrpcConnection { pool, conn, uri };
        self.connections.insert(id.to_string(), connection.clone());
        connection
    }
}
