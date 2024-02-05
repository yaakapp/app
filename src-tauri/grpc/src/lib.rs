use prost_reflect::SerializeOptions;
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;
use tonic::transport::Uri;
use tonic::IntoRequest;

use crate::proto::fill_pool;

mod codec;
mod json_schema;
pub mod manager;
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
