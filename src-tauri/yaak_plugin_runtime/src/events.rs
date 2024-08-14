use serde::{Deserialize, Serialize};
use ts_rs::TS;

use yaak_models::models::{
    CookieJar, Environment, Folder, GrpcConnection, GrpcEvent, GrpcRequest, HttpRequest,
    HttpResponse, KeyValue, Settings, Workspace,
};

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

    SendHttpRequestRequest(SendHttpRequestRequest),
    SendHttpRequestResponse(SendHttpRequestResponse),

    GetHttpRequestActionsRequest,
    GetHttpRequestActionsResponse(GetHttpRequestActionsResponse),
    CallHttpRequestActionRequest(CallHttpRequestActionRequest),

    CopyTextRequest(CopyTextRequest),

    RenderHttpRequestRequest(RenderHttpRequestRequest),
    RenderHttpRequestResponse(RenderHttpRequestResponse),

    ShowToastRequest(ShowToastRequest),

    GetHttpRequestByIdRequest(GetHttpRequestByIdRequest),
    GetHttpRequestByIdResponse(GetHttpRequestByIdResponse),

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
    pub content: String,
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

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct SendHttpRequestRequest {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct SendHttpRequestResponse {
    pub http_response: HttpResponse,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct CopyTextRequest {
    pub text: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct RenderHttpRequestRequest {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct RenderHttpRequestResponse {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct ShowToastRequest {
    pub message: String,
    pub variant: ToastVariant,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum ToastVariant {
    Custom,
    Copied,
    Success,
    Info,
    Warning,
    Error,
}

impl Default for ToastVariant {
    fn default() -> Self {
        ToastVariant::Info
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct GetHttpRequestActionsResponse {
    pub actions: Vec<HttpRequestAction>,
    pub plugin_ref_id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct HttpRequestAction {
    pub key: String,
    pub label: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct CallHttpRequestActionRequest {
    pub key: String,
    pub plugin_ref_id: String,
    pub args: CallHttpRequestActionArgs,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct CallHttpRequestActionArgs {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct GetHttpRequestByIdRequest {
    pub id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct GetHttpRequestByIdResponse {
    pub http_request: Option<HttpRequest>,
}

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
#[serde(rename_all = "camelCase", untagged)]
#[ts(export)]
pub enum Model {
    Environment(Environment),
    Folder(Folder),
    GrpcConnection(GrpcConnection),
    GrpcEvent(GrpcEvent),
    GrpcRequest(GrpcRequest),
    HttpRequest(HttpRequest),
    HttpResponse(HttpResponse),
    KeyValue(KeyValue),
    Workspace(Workspace),
    CookieJar(CookieJar),
    Settings(Settings),
}
