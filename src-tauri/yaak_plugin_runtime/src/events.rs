use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{Runtime, WebviewWindow};
use ts_rs::TS;

use yaak_models::models::{Environment, Folder, GrpcRequest, HttpRequest, HttpResponse, Workspace};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct InternalEvent {
    pub id: String,
    pub plugin_ref_id: String,
    pub reply_id: Option<String>,
    pub payload: InternalEventPayload,
    pub window_context: WindowContext,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case", tag = "type")]
#[ts(export, export_to = "events.ts")]
pub enum WindowContext {
    None,
    Label { label: String },
}

impl WindowContext {
    pub fn from_window<R: Runtime>(window: &WebviewWindow<R>) -> Self {
        Self::Label {
            label: window.label().to_string(),
        }
    }

    pub fn from_optional_window<R: Runtime>(window: Option<&WebviewWindow<R>>) -> Self {
        match window {
            None => WindowContext::None,
            Some(w) => Self::from_window(w),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case", tag = "type")]
#[ts(export, export_to = "events.ts")]
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

    TemplateRenderRequest(TemplateRenderRequest),
    TemplateRenderResponse(TemplateRenderResponse),

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
#[ts(export, export_to = "events.ts")]
pub struct BootRequest {
    pub dir: String,
    pub watch: bool,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct BootResponse {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct ImportRequest {
    pub content: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct ImportResponse {
    pub resources: ImportResources,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct FilterRequest {
    pub content: String,
    pub filter: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct FilterResponse {
    pub content: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct ExportHttpRequestRequest {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct ExportHttpRequestResponse {
    pub content: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct SendHttpRequestRequest {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct SendHttpRequestResponse {
    pub http_response: HttpResponse,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct CopyTextRequest {
    pub text: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct RenderHttpRequestRequest {
    pub http_request: HttpRequest,
    pub purpose: RenderPurpose,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct RenderHttpRequestResponse {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateRenderRequest {
    pub data: serde_json::Value,
    pub purpose: RenderPurpose,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateRenderResponse {
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct ShowToastRequest {
    pub message: String,
    #[ts(optional = nullable)]
    pub color: Option<Color>,
    #[ts(optional = nullable)]
    pub icon: Option<Icon>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export, export_to = "events.ts")]
pub enum Color {
    Custom,
    Default,
    Primary,
    Secondary,
    Info,
    Success,
    Notice,
    Warning,
    Danger,
}

impl Default for Color {
    fn default() -> Self {
        Color::Default
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export, export_to = "events.ts")]
pub enum Icon {
    Copy,
    Info,
    CheckCircle,
    AlertTriangle,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct GetTemplateFunctionsResponse {
    pub functions: Vec<TemplateFunction>,
    pub plugin_ref_id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateFunction {
    pub name: String,
    pub args: Vec<TemplateFunctionArg>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case", tag = "type")]
#[ts(export, export_to = "events.ts")]
pub enum TemplateFunctionArg {
    Text(TemplateFunctionTextArg),
    Select(TemplateFunctionSelectArg),
    Checkbox(TemplateFunctionCheckboxArg),
    HttpRequest(TemplateFunctionHttpRequestArg),
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
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
#[ts(export, export_to = "events.ts")]
pub struct TemplateFunctionTextArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
    #[ts(optional = nullable)]
    pub placeholder: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateFunctionHttpRequestArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateFunctionSelectArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
    pub options: Vec<TemplateFunctionSelectOption>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateFunctionCheckboxArg {
    #[serde(flatten)]
    pub base: TemplateFunctionBaseArg,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct TemplateFunctionSelectOption {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct CallTemplateFunctionRequest {
    pub name: String,
    pub args: CallTemplateFunctionArgs,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct CallTemplateFunctionResponse {
    pub value: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct CallTemplateFunctionArgs {
    pub purpose: RenderPurpose,
    pub values: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export, export_to = "events.ts")]
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
#[ts(export, export_to = "events.ts")]
pub struct GetHttpRequestActionsRequest {}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct GetHttpRequestActionsResponse {
    pub actions: Vec<HttpRequestAction>,
    pub plugin_ref_id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct HttpRequestAction {
    pub key: String,
    pub label: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct CallHttpRequestActionRequest {
    pub key: String,
    pub plugin_ref_id: String,
    pub args: CallHttpRequestActionArgs,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct CallHttpRequestActionArgs {
    pub http_request: HttpRequest,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct GetHttpRequestByIdRequest {
    pub id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct GetHttpRequestByIdResponse {
    pub http_request: Option<HttpRequest>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct FindHttpResponsesRequest {
    pub request_id: String,
    pub limit: Option<i32>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct FindHttpResponsesResponse {
    pub http_responses: Vec<HttpResponse>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "events.ts")]
pub struct ImportResources {
    pub workspaces: Vec<Workspace>,
    pub environments: Vec<Environment>,
    pub folders: Vec<Folder>,
    pub http_requests: Vec<HttpRequest>,
    pub grpc_requests: Vec<GrpcRequest>,
}
