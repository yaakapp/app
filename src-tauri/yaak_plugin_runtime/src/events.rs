use serde::{Deserialize, Serialize};
use ts_rs::TS;
use yaak_models::models::{Environment, Folder, GrpcRequest, HttpRequest, Workspace};

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
    ImportRequest(PluginImportRequest),
    ImportResponse(PluginImportResponse),
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginPingRequest {
    pub message: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginPingResponse {
    pub message: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginBootRequest {
    pub dir: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginBootResponse {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginImportRequest {
    pub content: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/events/")]
pub struct PluginImportResponse {
    pub resources: PluginImportResources,
}

// TODO: Migrate plugins to return this type
// #[derive(Debug, Clone, Serialize, Deserialize, TS)]
// #[serde(rename_all = "camelCase", untagged)]
// #[ts(export, export_to = "../../../plugin-runtime-types/src/gen/common/")]
// pub enum ExportableModel {
//     Workspace(Workspace),
//     Environment(Environment),
//     Folder(Folder),
//     HttpRequest(HttpRequest),
//     GrpcRequest(GrpcRequest),
// }

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "../../../plugin-runtime-types/src/gen/common/")]
pub struct PluginImportResources {
    pub workspaces: Vec<Workspace>,
    pub environments: Vec<Environment>,
    pub folders: Vec<Folder>,
    pub http_requests: Vec<HttpRequest>,
    pub grpc_requests: Vec<GrpcRequest>,
}
