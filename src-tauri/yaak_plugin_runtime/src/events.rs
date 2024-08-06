use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginEvent {
    pub id: String,
    pub plugin_ref_id: String,
    pub reply_id: Option<String>,
    pub payload: PluginEventPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub enum PluginEventPayload {
    PingRequest(PluginPingRequest),
    PingResponse(PluginPingResponse),
    BootRequest(PluginBootRequest),
    BootResponse(PluginBootResponse),
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginPingRequest {
    pub message: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginPingResponse {
    pub message: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginBootRequest {
    pub dir: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginBootResponse {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
}
