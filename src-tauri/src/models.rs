use std::collections::HashMap;
use std::fs;

use log::error;
use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono::NaiveDateTime;
use sqlx::types::{Json, JsonValue};
use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, Manager, WebviewWindow, Wry};
use tokio::sync::Mutex;

pub enum ModelType {
    TypeCookieJar,
    TypeEnvironment,
    TypeFolder,
    TypeGrpcConnection,
    TypeGrpcEvent,
    TypeGrpcRequest,
    TypeHttpRequest,
    TypeHttpResponse,
    TypeWorkspace,
}

impl ModelType {
    pub fn id_prefix(&self) -> String {
        match self {
            ModelType::TypeCookieJar => "cj",
            ModelType::TypeEnvironment => "ev",
            ModelType::TypeFolder => "fl",
            ModelType::TypeGrpcConnection => "gc",
            ModelType::TypeGrpcEvent => "ge",
            ModelType::TypeGrpcRequest => "gr",
            ModelType::TypeHttpRequest => "rq",
            ModelType::TypeHttpResponse => "rs",
            ModelType::TypeWorkspace => "wk",
        }
        .to_string()
    }
}

fn default_true() -> bool {
    true
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct Settings {
    pub id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub theme: String,
    pub appearance: String,
    pub theme_dark: String,
    pub theme_light: String,
    pub update_channel: String,
    pub interface_font_size: i64,
    pub interface_scale: i64,
    pub editor_font_size: i64,
    pub editor_soft_wrap: bool,
    pub open_workspace_new_window: Option<bool>,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct Workspace {
    pub id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub name: String,
    pub description: String,
    pub variables: Json<Vec<EnvironmentVariable>>,

    // Settings
    #[serde(default = "default_true")]
    pub setting_validate_certificates: bool,
    #[serde(default = "default_true")]
    pub setting_follow_redirects: bool,
    pub setting_request_timeout: i64,
}

// Implement default for Workspace
impl Workspace {
    pub(crate) fn new(name: String) -> Self {
        Self {
            name,
            model: "workspace".to_string(),
            setting_validate_certificates: true,
            setting_follow_redirects: true,
            ..Default::default()
        }
    }
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
pub struct CookieX {}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct CookieJar {
    pub id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub workspace_id: String,
    pub name: String,
    pub cookies: Json<Vec<JsonValue>>,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct Environment {
    pub id: String,
    pub workspace_id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub name: String,
    pub variables: Json<Vec<EnvironmentVariable>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct EnvironmentVariable {
    #[serde(default = "default_true")]
    pub enabled: bool,
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct Folder {
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub id: String,
    pub workspace_id: String,
    pub folder_id: Option<String>,
    pub model: String,
    pub name: String,
    pub sort_priority: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HttpRequestHeader {
    #[serde(default = "default_true")]
    pub enabled: bool,
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HttpUrlParameter {
    #[serde(default = "default_true")]
    pub enabled: bool,
    pub name: String,
    pub value: String,
}

fn default_http_request_method() -> String {
    "GET".to_string()
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HttpRequest {
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub id: String,
    pub workspace_id: String,
    pub folder_id: Option<String>,
    pub model: String,
    pub sort_priority: f64,
    pub name: String,
    pub url: String,
    pub url_parameters: Json<Vec<HttpUrlParameter>>,
    #[serde(default = "default_http_request_method")]
    pub method: String,
    pub body: Json<HashMap<String, JsonValue>>,
    pub body_type: Option<String>,
    pub authentication: Json<HashMap<String, JsonValue>>,
    pub authentication_type: Option<String>,
    pub headers: Json<Vec<HttpRequestHeader>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HttpResponseHeader {
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct HttpResponse {
    pub id: String,
    pub model: String,
    pub workspace_id: String,
    pub request_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub error: Option<String>,
    pub url: String,
    pub content_length: Option<i64>,
    pub version: Option<String>,
    pub elapsed: i64,
    pub elapsed_headers: i64,
    pub remote_addr: Option<String>,
    pub status: i64,
    pub status_reason: Option<String>,
    pub body_path: Option<String>,
    pub headers: Json<Vec<HttpResponseHeader>>,
}

impl HttpResponse {
    pub(crate) fn new() -> Self {
        Self {
            model: "http_response".to_string(),
            ..Default::default()
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct GrpcMetadataEntry {
    #[serde(default = "default_true")]
    pub enabled: bool,
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct GrpcRequest {
    pub id: String,
    pub model: String,
    pub workspace_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub folder_id: Option<String>,
    pub name: String,
    pub sort_priority: f64,
    pub url: String,
    pub service: Option<String>,
    pub method: Option<String>,
    pub message: String,
    pub authentication_type: Option<String>,
    pub authentication: Json<HashMap<String, JsonValue>>,
    pub metadata: Json<Vec<GrpcMetadataEntry>>,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct GrpcConnection {
    pub id: String,
    pub model: String,
    pub workspace_id: String,
    pub request_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub service: String,
    pub method: String,
    pub elapsed: i64,
    pub status: i64,
    pub url: String,
    pub error: Option<String>,
    pub trailers: Json<HashMap<String, String>>,
}

#[derive(sqlx::Type, Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case")]
pub enum GrpcEventType {
    Info,
    Error,
    ClientMessage,
    ServerMessage,
    ConnectionStart,
    ConnectionEnd,
}

impl Default for GrpcEventType {
    fn default() -> Self {
        GrpcEventType::Info
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct GrpcEvent {
    pub id: String,
    pub model: String,
    pub workspace_id: String,
    pub request_id: String,
    pub connection_id: String,
    pub created_at: NaiveDateTime,
    pub content: String,
    pub event_type: GrpcEventType,
    pub metadata: Json<HashMap<String, String>>,
    pub status: Option<i64>,
    pub error: Option<String>,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct KeyValue {
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub namespace: String,
    pub key: String,
    pub value: String,
}

pub async fn set_key_value_string(
    mgr: &impl Manager<Wry>,
    namespace: &str,
    key: &str,
    value: &str,
) -> (KeyValue, bool) {
    let encoded = serde_json::to_string(value);
    set_key_value_raw(mgr, namespace, key, &encoded.unwrap()).await
}

pub async fn set_key_value_int(
    mgr: &impl Manager<Wry>,
    namespace: &str,
    key: &str,
    value: i32,
) -> (KeyValue, bool) {
    let encoded = serde_json::to_string(&value);
    set_key_value_raw(mgr, namespace, key, &encoded.unwrap()).await
}

pub async fn get_key_value_string(
    mgr: &impl Manager<Wry>,
    namespace: &str,
    key: &str,
    default: &str,
) -> String {
    match get_key_value_raw(mgr, namespace, key).await {
        None => default.to_string(),
        Some(v) => {
            let result = serde_json::from_str(&v.value);
            match result {
                Ok(v) => v,
                Err(e) => {
                    error!("Failed to parse string key value: {}", e);
                    default.to_string()
                }
            }
        }
    }
}

pub async fn get_key_value_int(
    mgr: &impl Manager<Wry>,
    namespace: &str,
    key: &str,
    default: i32,
) -> i32 {
    match get_key_value_raw(mgr, namespace, key).await {
        None => default.clone(),
        Some(v) => {
            let result = serde_json::from_str(&v.value);
            match result {
                Ok(v) => v,
                Err(e) => {
                    error!("Failed to parse int key value: {}", e);
                    default.clone()
                }
            }
        }
    }
}

pub async fn set_key_value_raw(
    mgr: &impl Manager<Wry>,
    namespace: &str,
    key: &str,
    value: &str,
) -> (KeyValue, bool) {
    let db = get_db(mgr).await;
    let existing = get_key_value_raw(mgr, namespace, key).await;
    sqlx::query!(
        r#"
            INSERT INTO key_values (namespace, key, value)
            VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               value = excluded.value
        "#,
        namespace,
        key,
        value,
    )
    .execute(&db)
    .await
    .expect("Failed to insert key value");

    let kv = get_key_value_raw(mgr, namespace, key)
        .await
        .expect("Failed to get key value");
    (kv, existing.is_none())
}

pub async fn get_key_value_raw(
    mgr: &impl Manager<Wry>,
    namespace: &str,
    key: &str,
) -> Option<KeyValue> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        KeyValue,
        r#"
            SELECT model, created_at, updated_at, namespace, key, value
            FROM key_values
            WHERE namespace = ? AND key = ?
        "#,
        namespace,
        key,
    )
    .fetch_one(&db)
    .await
    .ok()
}

pub async fn list_workspaces(mgr: &impl Manager<Wry>) -> Result<Vec<Workspace>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Workspace,
        r#"
            SELECT
                id, model, created_at, updated_at, name, description, setting_request_timeout,
                setting_follow_redirects, setting_validate_certificates,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM workspaces
        "#,
    )
    .fetch_all(&db)
    .await
}

pub async fn get_workspace(mgr: &impl Manager<Wry>, id: &str) -> Result<Workspace, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Workspace,
        r#"
            SELECT
                id, model, created_at, updated_at, name, description, setting_request_timeout,
                setting_follow_redirects, setting_validate_certificates,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM workspaces WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn delete_workspace(window: &WebviewWindow, id: &str) -> Result<Workspace, sqlx::Error> {
    let db = get_db(window).await;
    let workspace = get_workspace(window, id).await?;
    let _ = sqlx::query!(
        r#"
            DELETE FROM workspaces
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    for r in list_responses_by_workspace_id(window, id).await? {
        delete_http_response(window, &r.id).await?;
    }

    emit_deleted_model(window, workspace)
}

pub async fn get_cookie_jar(mgr: &impl Manager<Wry>, id: &str) -> Result<CookieJar, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        CookieJar,
        r#"
            SELECT
                id, model, created_at, updated_at, workspace_id, name,
                cookies AS "cookies!: sqlx::types::Json<Vec<JsonValue>>"
            FROM cookie_jars WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn list_cookie_jars(
    mgr: &impl Manager<Wry>,
    workspace_id: &str,
) -> Result<Vec<CookieJar>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        CookieJar,
        r#"
            SELECT
                id, model, created_at, updated_at, workspace_id, name,
                cookies AS "cookies!: sqlx::types::Json<Vec<JsonValue>>"
            FROM cookie_jars WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn delete_cookie_jar(window: &WebviewWindow, id: &str) -> Result<CookieJar, sqlx::Error> {
    let cookie_jar = get_cookie_jar(window, id).await?;
    let db = get_db(window).await;

    let _ = sqlx::query!(
        r#"
            DELETE FROM cookie_jars
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, cookie_jar)
}

pub async fn duplicate_grpc_request(
    window: &WebviewWindow,
    id: &str,
) -> Result<GrpcRequest, sqlx::Error> {
    let mut request = get_grpc_request(window, id).await?.clone();
    request.id = "".to_string();
    upsert_grpc_request(window, &request).await
}

pub async fn upsert_grpc_request(
    window: &WebviewWindow,
    request: &GrpcRequest,
) -> Result<GrpcRequest, sqlx::Error> {
    let db = get_db(window).await;
    let id = match request.id.as_str() {
        "" => generate_model_id(ModelType::TypeGrpcRequest),
        _ => request.id.to_string(),
    };
    let trimmed_name = request.name.trim();
    sqlx::query!(
        r#"
            INSERT INTO grpc_requests (
                id, name, workspace_id, folder_id, sort_priority, url, service, method, message,
                authentication_type, authentication, metadata
             )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                updated_at = CURRENT_TIMESTAMP,
                workspace_id = excluded.workspace_id,
                name = excluded.name,
                folder_id = excluded.folder_id,
                sort_priority = excluded.sort_priority,
                url = excluded.url,
                service = excluded.service,
                method = excluded.method,
                message = excluded.message,
                authentication_type = excluded.authentication_type,
                authentication = excluded.authentication,
                metadata = excluded.metadata
        "#,
        id,
        trimmed_name,
        request.workspace_id,
        request.folder_id,
        request.sort_priority,
        request.url,
        request.service,
        request.method,
        request.message,
        request.authentication_type,
        request.authentication,
        request.metadata,
    )
    .execute(&db)
    .await?;

    match get_grpc_request(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn get_grpc_request(
    mgr: &impl Manager<Wry>,
    id: &str,
) -> Result<GrpcRequest, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        GrpcRequest,
        r#"
            SELECT
                id, model, workspace_id, folder_id, created_at, updated_at, name, sort_priority,
                url, service, method, message, authentication_type,
                authentication AS "authentication!: Json<HashMap<String, JsonValue>>",
                metadata AS "metadata!: sqlx::types::Json<Vec<GrpcMetadataEntry>>"
            FROM grpc_requests
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn list_grpc_requests(
    mgr: &impl Manager<Wry>,
    workspace_id: &str,
) -> Result<Vec<GrpcRequest>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        GrpcRequest,
        r#"
            SELECT
                id, model, workspace_id, folder_id, created_at, updated_at, name, sort_priority,
                url, service, method, message, authentication_type,
                authentication AS "authentication!: Json<HashMap<String, JsonValue>>",
                metadata AS "metadata!: sqlx::types::Json<Vec<GrpcMetadataEntry>>"
            FROM grpc_requests
            WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn upsert_grpc_connection(
    window: &WebviewWindow,
    connection: &GrpcConnection,
) -> Result<GrpcConnection, sqlx::Error> {
    let db = get_db(window).await;
    let id = match connection.id.as_str() {
        "" => generate_model_id(ModelType::TypeGrpcConnection),
        _ => connection.id.to_string(),
    };
    sqlx::query!(
        r#"
            INSERT INTO grpc_connections (
                id, workspace_id, request_id, service, method, elapsed,
                status, error, trailers, url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                updated_at = CURRENT_TIMESTAMP,
                service = excluded.service,
                method = excluded.method,
                elapsed = excluded.elapsed,
                status = excluded.status,
                error = excluded.error,
                trailers = excluded.trailers,
                url = excluded.url
        "#,
        id,
        connection.workspace_id,
        connection.request_id,
        connection.service,
        connection.method,
        connection.elapsed,
        connection.status,
        connection.error,
        connection.trailers,
        connection.url,
    )
    .execute(&db)
    .await?;

    match get_grpc_connection(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn get_grpc_connection(
    mgr: &impl Manager<Wry>,
    id: &str,
) -> Result<GrpcConnection, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        GrpcConnection,
        r#"
            SELECT
                id, model, workspace_id, request_id, created_at, updated_at, service,
                method, elapsed, status, error, url,
                trailers AS "trailers!: sqlx::types::Json<HashMap<String, String>>"
            FROM grpc_connections
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn list_grpc_connections(
    mgr: &impl Manager<Wry>,
    request_id: &str,
) -> Result<Vec<GrpcConnection>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        GrpcConnection,
        r#"
            SELECT
                id, model, workspace_id, request_id, created_at, updated_at, service,
                method, elapsed, status, error, url,
                trailers AS "trailers!: sqlx::types::Json<HashMap<String, String>>"
            FROM grpc_connections
            WHERE request_id = ?
            ORDER BY created_at DESC
        "#,
        request_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn upsert_grpc_event(
    window: &WebviewWindow,
    event: &GrpcEvent,
) -> Result<GrpcEvent, sqlx::Error> {
    let db = get_db(window).await;
    let id = match event.id.as_str() {
        "" => generate_model_id(ModelType::TypeGrpcEvent),
        _ => event.id.to_string(),
    };
    sqlx::query!(
        r#"
            INSERT INTO grpc_events (
                id, workspace_id, request_id, connection_id, content, event_type, metadata,
                status, error
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                updated_at = CURRENT_TIMESTAMP,
                content = excluded.content,
                event_type = excluded.event_type,
                metadata = excluded.metadata,
                status = excluded.status,
                error = excluded.error
        "#,
        id,
        event.workspace_id,
        event.request_id,
        event.connection_id,
        event.content,
        event.event_type,
        event.metadata,
        event.status,
        event.error,
    )
    .execute(&db)
    .await?;

    match get_grpc_event(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn get_grpc_event(mgr: &impl Manager<Wry>, id: &str) -> Result<GrpcEvent, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        GrpcEvent,
        r#"
            SELECT
                id, model, workspace_id, request_id, connection_id, created_at, content, status, error,
                event_type AS "event_type!: GrpcEventType",
                metadata AS "metadata!: sqlx::types::Json<HashMap<String, String>>"
            FROM grpc_events
            WHERE id = ?
        "#,
        id,
    )
        .fetch_one(&db)
        .await
}

pub async fn list_grpc_events(
    mgr: &impl Manager<Wry>,
    connection_id: &str,
) -> Result<Vec<GrpcEvent>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        GrpcEvent,
        r#"
            SELECT
                id, model, workspace_id, request_id, connection_id, created_at, content, status, error,
                event_type AS "event_type!: GrpcEventType",
                metadata AS "metadata!: sqlx::types::Json<HashMap<String, String>>"
            FROM grpc_events
            WHERE connection_id = ?
        "#,
        connection_id,
    )
        .fetch_all(&db)
        .await
}

pub async fn upsert_cookie_jar(
    window: &WebviewWindow,
    cookie_jar: &CookieJar,
) -> Result<CookieJar, sqlx::Error> {
    let id = match cookie_jar.id.as_str() {
        "" => generate_model_id(ModelType::TypeCookieJar),
        _ => cookie_jar.id.to_string(),
    };
    let trimmed_name = cookie_jar.name.trim();

    let db = get_db(window).await;
    sqlx::query!(
        r#"
            INSERT INTO cookie_jars (
                id, workspace_id, name, cookies
             )
            VALUES (?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               name = excluded.name,
               cookies = excluded.cookies
        "#,
        id,
        cookie_jar.workspace_id,
        trimmed_name,
        cookie_jar.cookies,
    )
    .execute(&db)
    .await?;

    match get_cookie_jar(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn list_environments(
    mgr: &impl Manager<Wry>,
    workspace_id: &str,
) -> Result<Vec<Environment>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Environment,
        r#"
            SELECT id, workspace_id, model, created_at, updated_at, name,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM environments
            WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn delete_environment(
    window: &WebviewWindow,
    id: &str,
) -> Result<Environment, sqlx::Error> {
    let db = get_db(window).await;
    let env = get_environment(window, id).await?;
    let _ = sqlx::query!(
        r#"
            DELETE FROM environments
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, env)
}

async fn get_settings(mgr: &impl Manager<Wry>) -> Result<Settings, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Settings,
        r#"
            SELECT
                id, model, created_at, updated_at, theme, appearance,
                theme_dark, theme_light, update_channel,
                interface_font_size, interface_scale, editor_font_size, editor_soft_wrap,
                open_workspace_new_window
            FROM settings
            WHERE id = 'default'
        "#,
    )
    .fetch_one(&db)
    .await
}

pub async fn get_or_create_settings(mgr: &impl Manager<Wry>) -> Settings {
    if let Ok(settings) = get_settings(mgr).await {
        return settings;
    }

    let db = get_db(mgr).await;
    sqlx::query!(
        r#"
                INSERT INTO settings (id)
                VALUES ('default')
            "#,
    )
    .execute(&db)
    .await
    .expect("Failed to insert settings");

    get_settings(mgr).await.expect("Failed to get settings")
}

pub async fn update_settings(
    window: &WebviewWindow,
    settings: Settings,
) -> Result<Settings, sqlx::Error> {
    let db = get_db(window).await;
    sqlx::query!(
        r#"
            UPDATE settings SET (
                theme, appearance, theme_dark, theme_light, update_channel,
                interface_font_size, interface_scale, editor_font_size, editor_soft_wrap,
                open_workspace_new_window
            ) = (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) WHERE id = 'default';
        "#,
        settings.theme,
        settings.appearance,
        settings.theme_dark,
        settings.theme_light,
        settings.update_channel,
        settings.interface_font_size,
        settings.interface_scale,
        settings.editor_font_size,
        settings.editor_soft_wrap,
        settings.open_workspace_new_window,
    )
    .execute(&db)
    .await?;

    match get_settings(window).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn upsert_environment(
    window: &WebviewWindow,
    environment: Environment,
) -> Result<Environment, sqlx::Error> {
    let id = match environment.id.as_str() {
        "" => generate_model_id(ModelType::TypeEnvironment),
        _ => environment.id.to_string(),
    };
    let trimmed_name = environment.name.trim();
    let db = get_db(window).await;
    sqlx::query!(
        r#"
            INSERT INTO environments (
                id, workspace_id, name, variables
            )
            VALUES (?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               name = excluded.name,
               variables = excluded.variables
        "#,
        id,
        environment.workspace_id,
        trimmed_name,
        environment.variables,
    )
    .execute(&db)
    .await?;

    match get_environment(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn get_environment(
    mgr: &impl Manager<Wry>,
    id: &str,
) -> Result<Environment, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Environment,
        r#"
            SELECT
                id, model, workspace_id, created_at, updated_at, name,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM environments
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn get_folder(mgr: &impl Manager<Wry>, id: &str) -> Result<Folder, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Folder,
        r#"
            SELECT
                id, model, workspace_id, created_at, updated_at, folder_id, name, sort_priority
            FROM folders
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn list_folders(
    mgr: &impl Manager<Wry>,
    workspace_id: &str,
) -> Result<Vec<Folder>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        Folder,
        r#"
            SELECT
                id, model, workspace_id, created_at, updated_at, folder_id, name, sort_priority
            FROM folders
            WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn delete_folder(window: &WebviewWindow, id: &str) -> Result<Folder, sqlx::Error> {
    let folder = get_folder(window, id).await?;
    let db = get_db(window).await;
    let _ = sqlx::query!(
        r#"
            DELETE FROM folders
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, folder)
}

pub async fn upsert_folder(window: &WebviewWindow, r: Folder) -> Result<Folder, sqlx::Error> {
    let id = match r.id.as_str() {
        "" => generate_model_id(ModelType::TypeFolder),
        _ => r.id.to_string(),
    };
    let trimmed_name = r.name.trim();

    let db = get_db(window).await;
    sqlx::query!(
        r#"
            INSERT INTO folders (
                id, workspace_id, folder_id, name, sort_priority
            )
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               name = excluded.name,
               folder_id = excluded.folder_id,
               sort_priority = excluded.sort_priority
        "#,
        id,
        r.workspace_id,
        r.folder_id,
        trimmed_name,
        r.sort_priority,
    )
    .execute(&db)
    .await?;

    match get_folder(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn duplicate_http_request(
    window: &WebviewWindow,
    id: &str,
) -> Result<HttpRequest, sqlx::Error> {
    let mut request = get_http_request(window, id).await?.clone();
    request.id = "".to_string();
    upsert_http_request(window, request).await
}

pub async fn upsert_http_request(
    window: &WebviewWindow,
    r: HttpRequest,
) -> Result<HttpRequest, sqlx::Error> {
    let id = match r.id.as_str() {
        "" => generate_model_id(ModelType::TypeHttpRequest),
        _ => r.id.to_string(),
    };
    let trimmed_name = r.name.trim();

    let db = get_db(window).await;

    sqlx::query!(
        r#"
            INSERT INTO http_requests (
                id, workspace_id, folder_id, name, url, url_parameters, method, body, body_type,
                authentication, authentication_type, headers, sort_priority
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               workspace_id = excluded.workspace_id,
               name = excluded.name,
               folder_id = excluded.folder_id,
               method = excluded.method,
               headers = excluded.headers,
               body = excluded.body,
               body_type = excluded.body_type,
               authentication = excluded.authentication,
               authentication_type = excluded.authentication_type,
               url = excluded.url,
               url_parameters = excluded.url_parameters,
               sort_priority = excluded.sort_priority
        "#,
        id,
        r.workspace_id,
        r.folder_id,
        trimmed_name,
        r.url,
        r.url_parameters,
        r.method,
        r.body,
        r.body_type,
        r.authentication,
        r.authentication_type,
        r.headers,
        r.sort_priority,
    )
    .execute(&db)
    .await?;

    match get_http_request(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn list_http_requests(
    mgr: &impl Manager<Wry>,
    workspace_id: &str,
) -> Result<Vec<HttpRequest>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        HttpRequest,
        r#"
            SELECT
                id, model, workspace_id, folder_id, created_at, updated_at, name, url,
                url_parameters AS "url_parameters!: sqlx::types::Json<Vec<HttpUrlParameter>>",
                method, body_type, authentication_type, sort_priority,
                body AS "body!: Json<HashMap<String, JsonValue>>",
                authentication AS "authentication!: Json<HashMap<String, JsonValue>>",
                headers AS "headers!: sqlx::types::Json<Vec<HttpRequestHeader>>"
            FROM http_requests
            WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn get_http_request(
    mgr: &impl Manager<Wry>,
    id: &str,
) -> Result<HttpRequest, sqlx::Error> {
    let db = get_db(mgr).await;

    sqlx::query_as!(
        HttpRequest,
        r#"
            SELECT
                id, model, workspace_id, folder_id, created_at, updated_at, name, url, method,
                body_type, authentication_type, sort_priority,
                url_parameters AS "url_parameters!: sqlx::types::Json<Vec<HttpUrlParameter>>",
                body AS "body!: Json<HashMap<String, JsonValue>>",
                authentication AS "authentication!: Json<HashMap<String, JsonValue>>",
                headers AS "headers!: sqlx::types::Json<Vec<HttpRequestHeader>>"
            FROM http_requests
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn delete_http_request(
    window: &WebviewWindow,
    id: &str,
) -> Result<HttpRequest, sqlx::Error> {
    let req = get_http_request(window, id).await?;

    // DB deletes will cascade but this will delete the files
    delete_all_http_responses(window, id).await?;

    let db = get_db(window).await;
    let _ = sqlx::query!(
        r#"
            DELETE FROM http_requests
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, req)
}

#[allow(clippy::too_many_arguments)]
pub async fn create_http_response(
    window: &WebviewWindow,
    request_id: &str,
    elapsed: i64,
    elapsed_headers: i64,
    url: &str,
    status: i64,
    status_reason: Option<&str>,
    content_length: Option<i64>,
    body_path: Option<&str>,
    headers: Vec<HttpResponseHeader>,
    version: Option<&str>,
    remote_addr: Option<&str>,
) -> Result<HttpResponse, sqlx::Error> {
    let req = get_http_request(window, request_id).await?;
    let id = generate_model_id(ModelType::TypeHttpResponse);
    let headers_json = Json(headers);
    let db = get_db(window).await;
    sqlx::query!(
        r#"
            INSERT INTO http_responses (
                id, request_id, workspace_id, elapsed, elapsed_headers, url, status, status_reason,
                content_length, body_path, headers, version, remote_addr
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        "#,
        id,
        request_id,
        req.workspace_id,
        elapsed,
        elapsed_headers,
        url,
        status,
        status_reason,
        content_length,
        body_path,
        headers_json,
        version,
        remote_addr,
    )
    .execute(&db)
    .await?;

    match get_http_response(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn cancel_pending_grpc_connections(app: &AppHandle) -> Result<(), sqlx::Error> {
    let db = get_db(app).await;
    sqlx::query!(
        r#"
            UPDATE grpc_connections
            SET (elapsed) = (-1)
            WHERE elapsed = 0;
        "#,
    )
    .execute(&db)
    .await?;
    Ok(())
}

pub async fn cancel_pending_responses(app: &AppHandle) -> Result<(), sqlx::Error> {
    let db = get_db(app).await;
    sqlx::query!(
        r#"
            UPDATE http_responses
            SET (elapsed, status_reason) = (-1, 'Cancelled')
            WHERE elapsed = 0;
        "#,
    )
    .execute(&db)
    .await?;
    Ok(())
}

pub async fn update_response_if_id(
    window: &WebviewWindow,
    response: &HttpResponse,
) -> Result<HttpResponse, sqlx::Error> {
    if response.id.is_empty() {
        Ok(response.clone())
    } else {
        update_response(window, response).await
    }
}

pub async fn upsert_workspace(
    window: &WebviewWindow,
    workspace: Workspace,
) -> Result<Workspace, sqlx::Error> {
    let id = match workspace.id.as_str() {
        "" => generate_model_id(ModelType::TypeWorkspace),
        _ => workspace.id.to_string(),
    };
    let trimmed_name = workspace.name.trim();

    let db = get_db(window).await;
    sqlx::query!(
        r#"
            INSERT INTO workspaces (
                id, name, description, variables, setting_request_timeout,
                setting_follow_redirects, setting_validate_certificates
             )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               name = excluded.name,
               description = excluded.description,
               variables = excluded.variables,
               setting_request_timeout = excluded.setting_request_timeout,
               setting_follow_redirects = excluded.setting_follow_redirects,
               setting_validate_certificates = excluded.setting_validate_certificates
        "#,
        id,
        trimmed_name,
        workspace.description,
        workspace.variables,
        workspace.setting_request_timeout,
        workspace.setting_follow_redirects,
        workspace.setting_validate_certificates,
    )
    .execute(&db)
    .await?;

    match get_workspace(window, &id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn update_response(
    window: &WebviewWindow,
    response: &HttpResponse,
) -> Result<HttpResponse, sqlx::Error> {
    let db = get_db(window).await;
    sqlx::query!(
        r#"
            UPDATE http_responses SET (
                elapsed, elapsed_headers, url, status, status_reason, content_length, body_path,
                error, headers, version, remote_addr, updated_at
            ) = (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) WHERE id = ?;
        "#,
        response.elapsed,
        response.elapsed_headers,
        response.url,
        response.status,
        response.status_reason,
        response.content_length,
        response.body_path,
        response.error,
        response.headers,
        response.version,
        response.remote_addr,
        response.id,
    )
    .execute(&db)
    .await?;

    match get_http_response(window, &response.id).await {
        Ok(m) => Ok(emit_upserted_model(window, m)),
        Err(e) => Err(e),
    }
}

pub async fn get_http_response(
    mgr: &impl Manager<Wry>,
    id: &str,
) -> Result<HttpResponse, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT
                id, model, workspace_id, request_id, updated_at, created_at, url, status,
                status_reason, content_length, body_path, elapsed, elapsed_headers, error,
                version, remote_addr,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(&db)
    .await
}

pub async fn list_responses(
    mgr: &impl Manager<Wry>,
    request_id: &str,
    limit: Option<i64>,
) -> Result<Vec<HttpResponse>, sqlx::Error> {
    let limit_unwrapped = limit.unwrap_or_else(|| i64::MAX);
    let db = get_db(mgr).await;
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT
                id, model, workspace_id, request_id, updated_at, created_at, url, status,
                status_reason, content_length, body_path, elapsed, elapsed_headers, error,
                version, remote_addr,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE request_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        "#,
        request_id,
        limit_unwrapped,
    )
    .fetch_all(&db)
    .await
}

pub async fn list_responses_by_workspace_id(
    mgr: &impl Manager<Wry>,
    workspace_id: &str,
) -> Result<Vec<HttpResponse>, sqlx::Error> {
    let db = get_db(mgr).await;
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT
                id, model, workspace_id, request_id, updated_at, created_at, url, status,
                status_reason, content_length, body_path, elapsed, elapsed_headers, error,
                version, remote_addr,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE workspace_id = ?
            ORDER BY created_at DESC
        "#,
        workspace_id,
    )
    .fetch_all(&db)
    .await
}

pub async fn delete_grpc_request(
    window: &WebviewWindow,
    id: &str,
) -> Result<GrpcRequest, sqlx::Error> {
    let req = get_grpc_request(window, id).await?;

    let db = get_db(window).await;
    let _ = sqlx::query!(
        r#"
            DELETE FROM grpc_requests
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, req)
}

pub async fn delete_grpc_connection(
    window: &WebviewWindow,
    id: &str,
) -> Result<GrpcConnection, sqlx::Error> {
    let resp = get_grpc_connection(window, id).await?;

    let db = get_db(window).await;
    let _ = sqlx::query!(
        r#"
            DELETE FROM grpc_connections
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, resp)
}

pub async fn delete_http_response(
    window: &WebviewWindow,
    id: &str,
) -> Result<HttpResponse, sqlx::Error> {
    let resp = get_http_response(window, id).await?;

    // Delete the body file if it exists
    if let Some(p) = resp.body_path.clone() {
        if let Err(e) = fs::remove_file(p) {
            error!("Failed to delete body file: {}", e);
        };
    }

    let db = get_db(window).await;
    let _ = sqlx::query!(
        r#"
            DELETE FROM http_responses
            WHERE id = ?
        "#,
        id,
    )
    .execute(&db)
    .await;

    emit_deleted_model(window, resp)
}

pub async fn delete_all_grpc_connections(
    window: &WebviewWindow,
    request_id: &str,
) -> Result<(), sqlx::Error> {
    for r in list_grpc_connections(window, request_id).await? {
        delete_grpc_connection(window, &r.id).await?;
    }
    Ok(())
}

pub async fn delete_all_http_responses(
    window: &WebviewWindow,
    request_id: &str,
) -> Result<(), sqlx::Error> {
    for r in list_responses(window, request_id, None).await? {
        delete_http_response(window, &r.id).await?;
    }
    Ok(())
}

pub fn generate_model_id(model: ModelType) -> String {
    let id = generate_id();
    format!("{}_{}", model.id_prefix(), id)
}

pub fn generate_id() -> String {
    Alphanumeric.sample_string(&mut rand::thread_rng(), 10)
}

#[derive(Default, Debug, Deserialize, Serialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkspaceExport {
    pub yaak_version: String,
    pub yaak_schema: i64,
    pub timestamp: NaiveDateTime,
    pub resources: WorkspaceExportResources,
}

#[derive(Default, Debug, Deserialize, Serialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkspaceExportResources {
    pub workspaces: Vec<Workspace>,
    pub environments: Vec<Environment>,
    pub folders: Vec<Folder>,
    pub http_requests: Vec<HttpRequest>,
    pub grpc_requests: Vec<GrpcRequest>,
}

pub async fn get_workspace_export_resources(
    window: &WebviewWindow,
    workspace_ids: Vec<&str>,
) -> WorkspaceExport {
    let app_handle = window.app_handle();
    let mut data = WorkspaceExport {
        yaak_version: app_handle.package_info().version.clone().to_string(),
        yaak_schema: 2,
        timestamp: chrono::Utc::now().naive_utc(),
        resources: WorkspaceExportResources {
            workspaces: Vec::new(),
            environments: Vec::new(),
            folders: Vec::new(),
            http_requests: Vec::new(),
            grpc_requests: Vec::new(),
        },
    };

    for workspace_id in workspace_ids {
        data.resources.workspaces.push(
            get_workspace(window, workspace_id)
                .await
                .expect("Failed to get workspace"),
        );
        data.resources.environments.append(
            &mut list_environments(window, workspace_id)
                .await
                .expect("Failed to get environments"),
        );
        data.resources.folders.append(
            &mut list_folders(window, workspace_id)
                .await
                .expect("Failed to get folders"),
        );
        data.resources.http_requests.append(
            &mut list_http_requests(window, workspace_id)
                .await
                .expect("Failed to get http requests"),
        );
        data.resources.grpc_requests.append(
            &mut list_grpc_requests(window, workspace_id)
                .await
                .expect("Failed to get grpc requests"),
        );
    }

    return data;
}

#[derive(Clone, Serialize)]
#[serde(default, rename_all = "camelCase")]
struct ModelPayload<M: Serialize + Clone> {
    pub model: M,
    pub window_label: String,
}

fn emit_upserted_model<M: Serialize + Clone>(window: &WebviewWindow, model: M) -> M {
    let payload = ModelPayload {
        model: model.clone(),
        window_label: window.label().to_string(),
    };

    window.emit("upserted_model", payload).unwrap();
    model
}

fn emit_deleted_model<M: Serialize + Clone, E>(window: &WebviewWindow, model: M) -> Result<M, E> {
    let payload = ModelPayload {
        model: model.clone(),
        window_label: window.label().to_string(),
    };
    window.emit("deleted_model", payload).unwrap();
    Ok(model)
}

async fn get_db(w: &impl Manager<Wry>) -> Pool<Sqlite> {
    let db_state = w.state::<Mutex<Pool<Sqlite>>>();
    let db = &*db_state.lock().await;
    db.clone()
}
