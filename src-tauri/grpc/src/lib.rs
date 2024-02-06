use prost_reflect::SerializeOptions;
use serde::{Deserialize, Serialize};

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
