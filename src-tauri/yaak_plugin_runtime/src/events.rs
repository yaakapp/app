use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

use yaak_models::models::{Environment, Folder, GrpcRequest, HttpRequest, HttpResponse, Workspace};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct InternalEvent {
    pub id: String,
    pub plugin_ref_id: String,
    pub reply_id: Option<String>,
    pub payload: InternalEventPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum InternalEventPayload {
    BootRequest(BootRequest),
    BootResponse(BootResponse),
    ImportRequest(ImportRequest),
    ImportResponse(ImportResponse),
    FilterRequest(FilterRequest),
    FilterResponse(FilterResponse),
    ExportHttpRequestRequest(ExportHttpRequestRequest),
    ExportHttpRequestResponse(ExportHttpRequestResponse),
    /// Returned when a plugin doesn't get run, just so the server
    /// has something to listen for
    EmptyResponse(EmptyResponse),
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default)]
#[ts(export, type = "{}")]
pub struct EmptyResponse {}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct BootRequest {
    pub dir: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct BootResponse {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct ImportRequest {
    pub content: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct ImportResponse {
    pub resources: ImportResources,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct FilterRequest {
    pub content: String,
    pub filter: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct FilterResponse {
    pub items: Vec<Value>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct ExportHttpRequestRequest {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct ExportHttpRequestResponse {
    pub content: String,
}

// TODO: Migrate plugins to return this type
// #[derive(Debug, Clone, Serialize, Deserialize, TS)]
// #[serde(rename_all = "camelCase", untagged)]
// #[ts(export)]
// pub enum ExportableModel {
//     Workspace(Workspace),
//     Environment(Environment),
//     Folder(Folder),
//     HttpRequest(HttpRequest),
//     GrpcRequest(GrpcRequest),
// }

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct ImportResources {
    pub workspaces: Vec<Workspace>,
    pub environments: Vec<Environment>,
    pub folders: Vec<Folder>,
    pub http_requests: Vec<HttpRequest>,
    pub grpc_requests: Vec<GrpcRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum Model {
    Workspace(Workspace),
    Environment(Environment),
    Folder(Folder),
    HttpRequest(HttpRequest),
    HttpResponse(HttpResponse),
    GrpcRequest(GrpcRequest),
}
