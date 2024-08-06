use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, TS)]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/")]
pub struct PluginBootRequest {
    pub dir: String,
}

#[derive(Deserialize, TS)]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/")]
pub struct PluginBootResponse {
    name: String,
    version: String,
    capabilities: Vec<String>,
}
