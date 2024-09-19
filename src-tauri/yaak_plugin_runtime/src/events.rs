use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

use yaak_models::models::{
    CookieJar, Environment, Folder, GrpcConnection, GrpcEvent, GrpcRequest, HttpRequest,
    HttpResponse, KeyValue, Plugin, Settings, Workspace,
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
#[serde(rename_all = "snake_case", tag = "type")]
#[ts(export)]
pub enum InternalEventPayload {
    BootRequest(BootRequest),
    BootResponse(BootResponse),

    ReloadRequest,
    ReloadResponse,

    TerminateRequest,
    TerminateResponse,

    ImportRequest(ImportRequest),
    ImportResponse(ImportResponse),

    FilterRequest(FilterRequest),
    FilterResponse(FilterResponse),

    ExportHttpRequestRequest(ExportHttpRequestRequest),
    ExportHttpRequestResponse(ExportHttpRequestResponse),

    SendHttpRequestRequest(SendHttpRequestRequest),
    SendHttpRequestResponse(SendHttpRequestResponse),

    GetHttpRequestActionsRequest(GetHttpRequestActionsRequest),
    GetHttpRequestActionsResponse(GetHttpRequestActionsResponse),
    CallHttpRequestActionRequest(CallHttpRequestActionRequest),

    GetTemplateFunctionsRequest,
    GetTemplateFunctionsResponse(GetTemplateFunctionsResponse),
    CallTemplateFunctionRequest(CallTemplateFunctionRequest),
    CallTemplateFunctionResponse(CallTemplateFunctionResponse),

    CopyTextRequest(CopyTextRequest),

    RenderHttpRequestRequest(RenderHttpRequestRequest),
    RenderHttpRequestResponse(RenderHttpRequestResponse),

    ShowToastRequest(ShowToastRequest),

    GetHttpRequestByIdRequest(GetHttpRequestByIdRequest),
    GetHttpRequestByIdResponse(GetHttpRequestByIdResponse),

    FindHttpResponsesRequest(FindHttpResponsesRequest),
    FindHttpResponsesResponse(FindHttpResponsesResponse),

    /// Returned when a plugin doesn't get run, just so the server
    /// has something to listen for
    EmptyResponse,
}

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
    pub purpose: RenderPurpose,
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
#[serde(rename_all = "snake_case")]
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
pub struct GetTemplateFunctionsResponse {
    pub functions: Vec<TemplateFunction>,
    pub plugin_ref_id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunction {
    pub name: String,
    pub args: Vec<TemplateFunctionArg>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case", tag = "type")]
#[ts(export)]
pub enum TemplateFunctionArg {
    Text(TemplateFunctionTextArg),
    Select(TemplateFunctionSelectArg),
    Checkbox(TemplateFunctionCheckboxArg),
    HttpRequest(TemplateFunctionHttpRequestArg),
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunctionBaseArg {
    pub name: String,
    #[ts(optional = nullable)]
    pub optional: Option<bool>,
    #[ts(optional = nullable)]
    pub label: Option<String>,
    #[ts(optional = nullable)]
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunctionTextArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
    #[ts(optional = nullable)]
    pub placeholder: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunctionHttpRequestArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunctionSelectArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
    pub options: Vec<TemplateFunctionSelectOption>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunctionCheckboxArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct TemplateFunctionSelectOption {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct CallTemplateFunctionRequest {
    pub name: String,
    pub args: CallTemplateFunctionArgs,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct CallTemplateFunctionResponse {
    pub value: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct CallTemplateFunctionArgs {
    pub purpose: RenderPurpose,
    pub values: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum RenderPurpose {
    Send,
    Preview,
}

impl Default for RenderPurpose {
    fn default() -> Self {
        RenderPurpose::Preview
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default)]
#[ts(export)]
pub struct GetHttpRequestActionsRequest {}

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
pub struct FindHttpResponsesRequest {
    pub request_id: String,
    pub limit: Option<i32>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export)]
pub struct FindHttpResponsesResponse {
    pub http_responses: Vec<HttpResponse>,
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
    Plugin(Plugin),
}
