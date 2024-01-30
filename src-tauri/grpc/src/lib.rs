use prost_reflect::DynamicMessage;
use serde::{Deserialize, Serialize};
use serde_json::Deserializer;
use tonic::IntoRequest;
use tonic::transport::Uri;

use crate::codec::DynamicCodec;
use crate::proto::{fill_pool, method_desc_to_path};

mod codec;
mod json_schema;
mod proto;

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct ServiceDefinition {
    pub name: String,
    pub methods: Vec<MethodDefinition>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct MethodDefinition {
    pub name: String,
    pub schema: String,
}

pub async fn call(uri: &Uri, service: &str, method: &str, message_json: &str) -> String {
    let (pool, conn) = fill_pool(uri).await;

    let service = pool.get_service_by_name(service).unwrap();
    let method = &service.methods().find(|m| m.name() == method).unwrap();
    let input_message = method.input();

    let mut deserializer = Deserializer::from_str(message_json);
    let req_message = DynamicMessage::deserialize(input_message, &mut deserializer).unwrap();
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
    let response_json = serde_json::to_string_pretty(&resp.into_inner()).expect("json to string");
    println!("\n---------- RECEIVING ---------------\n{}", response_json,);

    response_json
}

pub async fn callable(uri: &Uri) -> Vec<ServiceDefinition> {
    let (pool, _) = fill_pool(uri).await;

    pool.services()
        .map(|s| {
            let mut def = ServiceDefinition {
                name: s.full_name().to_string(),
                ..Default::default()
            };
            for method in s.methods() {
                let input_message = method.input();
                def.methods.push(MethodDefinition {
                    name: method.name().to_string(),
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
