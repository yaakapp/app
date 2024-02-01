use prost::Message;
use prost_reflect::{DynamicMessage, SerializeOptions};
use serde::{Deserialize, Serialize};
use serde_json::Deserializer;
use tokio_stream::{Stream, StreamExt};
use tonic::transport::Uri;
use tonic::{IntoRequest, Response, Streaming};

use crate::codec::DynamicCodec;
use crate::proto::{fill_pool, method_desc_to_path};

mod codec;
mod json_schema;
mod proto;

pub fn serialize_options() -> SerializeOptions {
    SerializeOptions::new().skip_default_fields(false)
}

#[derive(Serialize, Deserialize, Debug, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct ServiceDefinition {
    pub name: String,
    pub methods: Vec<MethodDefinition>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct MethodDefinition {
    pub name: String,
    pub schema: String,
    pub client_streaming: bool,
    pub server_streaming: bool,
}

pub async fn unary(
    uri: &Uri,
    service: &str,
    method: &str,
    message_json: &str,
) -> Result<String, String> {
    let (pool, conn) = fill_pool(uri).await;

    let service = pool.get_service_by_name(service).unwrap();
    let method = &service.methods().find(|m| m.name() == method).unwrap();
    let input_message = method.input();

    let mut deserializer = Deserializer::from_str(message_json);
    let req_message =
        DynamicMessage::deserialize(input_message, &mut deserializer).map_err(|e| e.to_string())?;
    deserializer.end().unwrap();

    let mut client = tonic::client::Grpc::new(conn);

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

struct ClientStream {}

impl Stream for ClientStream {
    type Item = DynamicMessage;

    fn poll_next(
        self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Option<Self::Item>> {
        println!("poll_next");
        todo!()
    }
}

pub async fn client_streaming(
    uri: &Uri,
    service: &str,
    method: &str,
    message_json: &str,
) -> Result<String, String> {
    let (pool, conn) = fill_pool(uri).await;

    let service = pool.get_service_by_name(service).unwrap();
    let method = &service.methods().find(|m| m.name() == method).unwrap();
    let input_message = method.input();

    let mut deserializer = Deserializer::from_str(message_json);
    let req_message =
        DynamicMessage::deserialize(input_message, &mut deserializer).map_err(|e| e.to_string())?;
    deserializer.end().unwrap();

    let mut client = tonic::client::Grpc::new(conn);

    println!(
        "\n---------- SENDING -----------------\n{}",
        serde_json::to_string_pretty(&req_message).expect("json")
    );

    let req = tonic::Request::new(ClientStream {});

    let path = method_desc_to_path(method);
    let codec = DynamicCodec::new(method.clone());
    client.ready().await.unwrap();

    let resp = client.client_streaming(req, path, codec).await.unwrap();
    let response_json = serde_json::to_string_pretty(&resp.into_inner()).expect("json to string");
    println!("\n---------- RECEIVING ---------------\n{}", response_json,);

    Ok(response_json)
}

pub async fn server_streaming(
    uri: &Uri,
    service: &str,
    method: &str,
    message_json: &str,
) -> Result<Response<Streaming<DynamicMessage>>, String> {
    let (pool, conn) = fill_pool(uri).await;

    let service = pool.get_service_by_name(service).unwrap();
    let method = &service.methods().find(|m| m.name() == method).unwrap();
    let input_message = method.input();

    let mut deserializer = Deserializer::from_str(message_json);
    let req_message =
        DynamicMessage::deserialize(input_message, &mut deserializer).map_err(|e| e.to_string())?;
    deserializer.end().unwrap();

    let mut client = tonic::client::Grpc::new(conn);

    println!(
        "\n---------- SENDING -----------------\n{}",
        serde_json::to_string_pretty(&req_message).expect("json")
    );

    let req = req_message.into_request();
    let path = method_desc_to_path(method);
    let codec = DynamicCodec::new(method.clone());
    client.ready().await.unwrap();

    let resp = client.server_streaming(req, path, codec).await.unwrap();
    // let response_json = serde_json::to_string_pretty(&resp.into_inner()).expect("json to string");
    // println!("\n---------- RECEIVING ---------------\n{}", response_json,);

    // Ok(response_json)
    Ok(resp)
}

pub async fn callable(uri: &Uri) -> Vec<ServiceDefinition> {
    let (pool, _) = fill_pool(uri).await;

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
