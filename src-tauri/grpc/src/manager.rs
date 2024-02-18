use std::collections::HashMap;
use std::path::PathBuf;
use std::str::FromStr;

use hyper::client::HttpConnector;
use hyper::Client;
use hyper_rustls::HttpsConnector;
pub use prost_reflect::DynamicMessage;
use prost_reflect::{DescriptorPool, MethodDescriptor, ServiceDescriptor};
use serde_json::Deserializer;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;
use tonic::body::BoxBody;
use tonic::metadata::{MetadataKey, MetadataValue};
use tonic::transport::Uri;
use tonic::{IntoRequest, IntoStreamingRequest, Request, Response, Status, Streaming};

use crate::codec::DynamicCodec;
use crate::proto::{fill_pool, fill_pool_from_files, get_transport, method_desc_to_path};
use crate::{json_schema, MethodDefinition, ServiceDefinition};

#[derive(Clone)]
pub struct GrpcConnection {
    pool: DescriptorPool,
    conn: Client<HttpsConnector<HttpConnector>, BoxBody>,
    pub uri: Uri,
}

impl GrpcConnection {
    pub fn service(&self, service: &str) -> Result<ServiceDescriptor, String> {
        let service = self
            .pool
            .get_service_by_name(service)
            .ok_or("Failed to find service")?;
        Ok(service)
    }

    pub fn method(&self, service: &str, method: &str) -> Result<MethodDescriptor, String> {
        let service = self.service(service)?;
        let method = service
            .methods()
            .find(|m| m.name() == method)
            .ok_or("Failed to find method")?;
        Ok(method)
    }

    pub async fn unary(
        &self,
        service: &str,
        method: &str,
        message: &str,
        metadata: HashMap<String, String>,
    ) -> Result<DynamicMessage, String> {
        let method = &self.method(&service, &method)?;
        let input_message = method.input();

        let mut deserializer = Deserializer::from_str(message);
        let req_message = DynamicMessage::deserialize(input_message, &mut deserializer)
            .map_err(|e| e.to_string())?;
        deserializer.end().unwrap();

        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

        let mut req = req_message.into_request();
        decorate_req(metadata, &mut req).map_err(|e| e.to_string())?;

        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.unwrap();

        Ok(client
            .unary(req, path, codec)
            .await
            .map_err(|e| e.to_string())?
            .into_inner())
    }

    pub async fn streaming(
        &self,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
        metadata: HashMap<String, String>,
    ) -> Result<Result<Response<Streaming<DynamicMessage>>, Status>, String> {
        let method = &self.method(&service, &method)?;
        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

        let method2 = method.clone();
        let mut req = stream
            .map(move |s| {
                let mut deserializer = Deserializer::from_str(&s);
                let req_message = DynamicMessage::deserialize(method2.input(), &mut deserializer)
                    .map_err(|e| e.to_string())
                    .unwrap();
                deserializer.end().unwrap();
                req_message
            })
            .into_streaming_request();

        decorate_req(metadata, &mut req).map_err(|e| e.to_string())?;

        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.map_err(|e| e.to_string())?;
        Ok(client.streaming(req, path, codec).await)
    }

    pub async fn client_streaming(
        &self,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
        metadata: HashMap<String, String>,
    ) -> Result<DynamicMessage, String> {
        let method = &self.method(&service, &method)?;
        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

        let mut req = {
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

        decorate_req(metadata, &mut req).map_err(|e| e.to_string())?;

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
        metadata: HashMap<String, String>,
    ) -> Result<Result<Response<Streaming<DynamicMessage>>, Status>, String> {
        let method = &self.method(&service, &method)?;
        let input_message = method.input();

        let mut deserializer = Deserializer::from_str(message);
        let req_message = DynamicMessage::deserialize(input_message, &mut deserializer)
            .map_err(|e| e.to_string())?;
        deserializer.end().unwrap();

        let mut client = tonic::client::Grpc::with_origin(self.conn.clone(), self.uri.clone());

        let mut req = req_message.into_request();
        decorate_req(metadata, &mut req).map_err(|e| e.to_string())?;

        let path = method_desc_to_path(method);
        let codec = DynamicCodec::new(method.clone());
        client.ready().await.map_err(|e| e.to_string())?;
        Ok(client.server_streaming(req, path, codec).await)
    }
}

pub struct GrpcHandle {
    pools: HashMap<String, DescriptorPool>,
}

impl Default for GrpcHandle {
    fn default() -> Self {
        let pools = HashMap::new();
        Self { pools }
    }
}

impl GrpcHandle {
    pub async fn services_from_files(
        &mut self,
        id: &str,
        uri: &Uri,
        paths: Vec<PathBuf>,
    ) -> Result<Vec<ServiceDefinition>, String> {
        let pool = fill_pool_from_files(paths).await?;
        self.pools.insert(self.get_pool_key(id, uri), pool.clone());
        Ok(self.services_from_pool(&pool))
    }
    pub async fn services_from_reflection(
        &mut self,
        id: &str,
        uri: &Uri,
    ) -> Result<Vec<ServiceDefinition>, String> {
        let pool = fill_pool(uri).await?;
        self.pools.insert(self.get_pool_key(id, uri), pool.clone());
        Ok(self.services_from_pool(&pool))
    }

    fn get_pool_key(&self, id: &str, uri: &Uri) -> String {
        format!("{}-{}", id, uri)
    }

    fn services_from_pool(&self, pool: &DescriptorPool) -> Vec<ServiceDefinition> {
        pool.services()
            .map(|s| {
                let mut def = ServiceDefinition {
                    name: s.full_name().to_string(),
                    methods: vec![],
                };
                for method in s.methods() {
                    let input_message = method.input();
                    def.methods.push(MethodDefinition {
                        name: method.name().to_string(),
                        server_streaming: method.is_server_streaming(),
                        client_streaming: method.is_client_streaming(),
                        schema: serde_json::to_string_pretty(&json_schema::message_to_json_schema(
                            &pool,
                            input_message,
                        ))
                        .unwrap(),
                    })
                }
                def
            })
            .collect::<Vec<_>>()
    }

    pub async fn server_streaming(
        &mut self,
        id: &str,
        uri: Uri,
        proto_files: Vec<PathBuf>,
        service: &str,
        method: &str,
        message: &str,
        metadata: HashMap<String, String>,
    ) -> Result<Result<Response<Streaming<DynamicMessage>>, Status>, String> {
        self.connect(id, uri, proto_files)
            .await?
            .server_streaming(service, method, message, metadata)
            .await
    }

    pub async fn client_streaming(
        &mut self,
        id: &str,
        uri: Uri,
        proto_files: Vec<PathBuf>,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
        metadata: HashMap<String, String>,
    ) -> Result<DynamicMessage, String> {
        self.connect(id, uri, proto_files)
            .await?
            .client_streaming(service, method, stream, metadata)
            .await
    }

    pub async fn streaming(
        &mut self,
        id: &str,
        uri: Uri,
        proto_files: Vec<PathBuf>,
        service: &str,
        method: &str,
        stream: ReceiverStream<String>,
        metadata: HashMap<String, String>,
    ) -> Result<Result<Response<Streaming<DynamicMessage>>, Status>, String> {
        self.connect(id, uri, proto_files)
            .await?
            .streaming(service, method, stream, metadata)
            .await
    }

    pub async fn connect(
        &mut self,
        id: &str,
        uri: Uri,
        proto_files: Vec<PathBuf>,
    ) -> Result<GrpcConnection, String> {
        let pool = match self.pools.get(id) {
            Some(p) => p.clone(),
            None => match proto_files.len() {
                0 => fill_pool(&uri).await?,
                _ => {
                    let pool = fill_pool_from_files(proto_files).await?;
                    self.pools.insert(id.to_string(), pool.clone());
                    pool
                }
            },
        };

        let conn = get_transport();
        let connection = GrpcConnection { pool, conn, uri };
        Ok(connection)
    }
}

fn decorate_req<T>(metadata: HashMap<String, String>, req: &mut Request<T>) -> Result<(), String> {
    for (k, v) in metadata {
        req.metadata_mut().insert(
            MetadataKey::from_str(k.as_str()).map_err(|e| e.to_string())?,
            MetadataValue::from_str(v.as_str()).map_err(|e| e.to_string())?,
        );
    }
    Ok(())
}
