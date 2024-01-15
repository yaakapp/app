use std::collections::HashMap;
use std::fs;

use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono::NaiveDateTime;
use sqlx::types::{Json, JsonValue};
use sqlx::{Pool, Sqlite};
use tauri::AppHandle;

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
    pub elapsed: i64,
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

pub async fn set_key_value(
    namespace: &str,
    key: &str,
    value: &str,
    pool: &Pool<Sqlite>,
) -> (KeyValue, bool) {
    let existing = get_key_value(namespace, key, pool).await;
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
    .execute(pool)
    .await
    .expect("Failed to insert key value");

    let kv = get_key_value(namespace, key, pool)
        .await
        .expect("Failed to get key value");
    (kv, existing.is_none())
}

pub async fn get_key_value(namespace: &str, key: &str, pool: &Pool<Sqlite>) -> Option<KeyValue> {
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
    .fetch_one(pool)
    .await
    .ok()
}

pub async fn get_key_value_string(
    namespace: &str,
    key: &str,
    pool: &Pool<Sqlite>,
) -> Option<String> {
    let kv = get_key_value(namespace, key, pool).await?;
    let result = serde_json::from_str(&kv.value);
    match result {
        Ok(v) => Some(v),
        Err(e) => {
            println!("Failed to parse key value: {}", e);
            None
        }
    }
}

pub async fn find_workspaces(pool: &Pool<Sqlite>) -> Result<Vec<Workspace>, sqlx::Error> {
    sqlx::query_as!(
        Workspace,
        r#"
            SELECT
                id,
                model,
                created_at,
                updated_at,
                name,
                description,
                setting_request_timeout,
                setting_follow_redirects,
                setting_validate_certificates,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM workspaces
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn get_workspace(id: &str, pool: &Pool<Sqlite>) -> Result<Workspace, sqlx::Error> {
    sqlx::query_as!(
        Workspace,
        r#"
            SELECT
                id,
                model,
                created_at,
                updated_at,
                name,
                description,
                setting_request_timeout,
                setting_follow_redirects,
                setting_validate_certificates,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM workspaces WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

pub async fn delete_workspace(id: &str, pool: &Pool<Sqlite>) -> Result<Workspace, sqlx::Error> {
    let workspace = get_workspace(id, pool).await?;
    let _ = sqlx::query!(
        r#"
            DELETE FROM workspaces
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;

    for r in find_responses_by_workspace_id(id, pool).await? {
        delete_response(&r.id, pool).await?;
    }

    Ok(workspace)
}

pub async fn find_environments(
    workspace_id: &str,
    pool: &Pool<Sqlite>,
) -> Result<Vec<Environment>, sqlx::Error> {
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
    .fetch_all(pool)
    .await
}

pub async fn delete_environment(id: &str, pool: &Pool<Sqlite>) -> Result<Environment, sqlx::Error> {
    let env = get_environment(id, pool).await?;
    let _ = sqlx::query!(
        r#"
            DELETE FROM environments
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;

    Ok(env)
}

async fn get_settings(pool: &Pool<Sqlite>) -> Result<Settings, sqlx::Error> {
    sqlx::query_as!(
        Settings,
        r#"
            SELECT
                id,
                model,
                created_at,
                updated_at,
                theme,
                appearance
            FROM settings
            WHERE id = 'default'
        "#,
    )
    .fetch_one(pool)
    .await
}

pub async fn get_or_create_settings(pool: &Pool<Sqlite>) -> Result<Settings, sqlx::Error> {
    let existing = get_settings(pool).await;
    if let Ok(s) = existing {
        Ok(s)
    } else {
        sqlx::query!(
            r#"
                INSERT INTO settings (id)
                VALUES ('default')
            "#,
        )
        .execute(pool)
        .await?;
        get_settings(pool).await
    }
}

pub async fn update_settings(
    pool: &Pool<Sqlite>,
    settings: Settings,
) -> Result<Settings, sqlx::Error> {
    sqlx::query!(
        r#"
            UPDATE settings SET (
                theme,
                appearance
            ) = (?, ?) WHERE id = 'default';
        "#,
        settings.theme,
        settings.appearance,
    )
    .execute(pool)
    .await?;
    get_settings(pool).await
}

pub async fn upsert_environment(
    pool: &Pool<Sqlite>,
    environment: Environment,
) -> Result<Environment, sqlx::Error> {
    let id = match environment.id.as_str() {
        "" => generate_id(Some("ev")),
        _ => environment.id.to_string(),
    };
    let trimmed_name = environment.name.trim();
    sqlx::query!(
        r#"
            INSERT INTO environments (
                id,
                workspace_id,
                name,
                variables
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
    .execute(pool)
    .await?;
    get_environment(&id, pool).await
}

pub async fn get_environment(id: &str, pool: &Pool<Sqlite>) -> Result<Environment, sqlx::Error> {
    sqlx::query_as!(
        Environment,
        r#"
            SELECT
                id,
                model,
                workspace_id,
                created_at,
                updated_at,
                name,
                variables AS "variables!: sqlx::types::Json<Vec<EnvironmentVariable>>"
            FROM environments
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

pub async fn get_folder(id: &str, pool: &Pool<Sqlite>) -> Result<Folder, sqlx::Error> {
    sqlx::query_as!(
        Folder,
        r#"
            SELECT
                id,
                model,
                workspace_id,
                created_at,
                updated_at,
                folder_id,
                name,
                sort_priority
            FROM folders
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

pub async fn find_folders(
    workspace_id: &str,
    pool: &Pool<Sqlite>,
) -> Result<Vec<Folder>, sqlx::Error> {
    sqlx::query_as!(
        Folder,
        r#"
            SELECT
                id,
                model,
                workspace_id,
                created_at,
                updated_at,
                folder_id,
                name,
                sort_priority
            FROM folders
            WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(pool)
    .await
}

pub async fn delete_folder(id: &str, pool: &Pool<Sqlite>) -> Result<Folder, sqlx::Error> {
    let env = get_folder(id, pool).await?;
    let _ = sqlx::query!(
        r#"
            DELETE FROM folders
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;

    Ok(env)
}

pub async fn upsert_folder(pool: &Pool<Sqlite>, r: Folder) -> Result<Folder, sqlx::Error> {
    let id = match r.id.as_str() {
        "" => generate_id(Some("fl")),
        _ => r.id.to_string(),
    };
    let trimmed_name = r.name.trim();

    sqlx::query!(
        r#"
            INSERT INTO folders (
                id,
                workspace_id,
                folder_id,
                name,
                sort_priority
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
    .execute(pool)
    .await?;

    get_folder(&id, pool).await
}

pub async fn duplicate_request(id: &str, pool: &Pool<Sqlite>) -> Result<HttpRequest, sqlx::Error> {
    let mut request = get_request(id, pool).await?.clone();
    request.id = "".to_string();
    upsert_request(pool, request).await
}

pub async fn upsert_request(
    pool: &Pool<Sqlite>,
    r: HttpRequest,
) -> Result<HttpRequest, sqlx::Error> {
    let id = match r.id.as_str() {
        "" => generate_id(Some("rq")),
        _ => r.id.to_string(),
    };
    let headers_json = Json(r.headers);
    let auth_json = Json(r.authentication);
    let trimmed_name = r.name.trim();

    sqlx::query!(
        r#"
            INSERT INTO http_requests (
                id,
                workspace_id,
                folder_id,
                name,
                url,
                url_parameters,
                method,
                body,
                body_type,
                authentication,
                authentication_type,
                headers,
                sort_priority
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
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
        auth_json,
        r.authentication_type,
        headers_json,
        r.sort_priority,
    )
    .execute(pool)
    .await?;

    get_request(&id, pool).await
}

pub async fn find_requests(
    workspace_id: &str,
    pool: &Pool<Sqlite>,
) -> Result<Vec<HttpRequest>, sqlx::Error> {
    sqlx::query_as!(
        HttpRequest,
        r#"
            SELECT
                id,
                model,
                workspace_id,
                folder_id,
                created_at,
                updated_at,
                name,
                url,
                url_parameters AS "url_parameters!: sqlx::types::Json<Vec<HttpUrlParameter>>",
                method,
                body AS "body!: Json<HashMap<String, JsonValue>>",
                body_type,
                authentication AS "authentication!: Json<HashMap<String, JsonValue>>",
                authentication_type,
                sort_priority,
                headers AS "headers!: sqlx::types::Json<Vec<HttpRequestHeader>>"
            FROM http_requests
            WHERE workspace_id = ?
        "#,
        workspace_id,
    )
    .fetch_all(pool)
    .await
}

pub async fn get_request(id: &str, pool: &Pool<Sqlite>) -> Result<HttpRequest, sqlx::Error> {
    sqlx::query_as!(
        HttpRequest,
        r#"
            SELECT
                id,
                model,
                workspace_id,
                folder_id,
                created_at,
                updated_at,
                name,
                url,
                url_parameters AS "url_parameters!: sqlx::types::Json<Vec<HttpUrlParameter>>",
                method,
                body AS "body!: Json<HashMap<String, JsonValue>>",
                body_type,
                authentication AS "authentication!: Json<HashMap<String, JsonValue>>",
                authentication_type,
                sort_priority,
                headers AS "headers!: sqlx::types::Json<Vec<HttpRequestHeader>>"
            FROM http_requests
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

pub async fn delete_request(id: &str, pool: &Pool<Sqlite>) -> Result<HttpRequest, sqlx::Error> {
    let req = get_request(id, pool).await?;

    // DB deletes will cascade but this will delete the files
    delete_all_responses(id, pool).await?;

    let _ = sqlx::query!(
        r#"
            DELETE FROM http_requests
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;

    Ok(req)
}

pub async fn create_response(
    request_id: &str,
    elapsed: i64,
    url: &str,
    status: i64,
    status_reason: Option<&str>,
    content_length: Option<i64>,
    body_path: Option<&str>,
    headers: Vec<HttpResponseHeader>,
    pool: &Pool<Sqlite>,
) -> Result<HttpResponse, sqlx::Error> {
    let req = get_request(request_id, pool).await?;
    let id = generate_id(Some("rp"));
    let headers_json = Json(headers);
    sqlx::query!(
        r#"
            INSERT INTO http_responses (
                id,
                request_id,
                workspace_id,
                elapsed,
                url,
                status,
                status_reason,
                content_length,
                body_path,
                headers
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        "#,
        id,
        request_id,
        req.workspace_id,
        elapsed,
        url,
        status,
        status_reason,
        content_length,
        body_path,
        headers_json,
    )
    .execute(pool)
    .await?;

    get_response(&id, pool).await
}

pub async fn cancel_pending_responses(pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
            UPDATE http_responses
            SET (elapsed, status_reason) = (-1, 'Cancelled')
            WHERE elapsed = 0;
        "#,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn update_response_if_id(
    response: &HttpResponse,
    pool: &Pool<Sqlite>,
) -> Result<HttpResponse, sqlx::Error> {
    if response.id.is_empty() {
        Ok(response.clone())
    } else {
        update_response(response, pool).await
    }
}

pub async fn upsert_workspace(
    pool: &Pool<Sqlite>,
    workspace: Workspace,
) -> Result<Workspace, sqlx::Error> {
    let id = match workspace.id.as_str() {
        "" => generate_id(Some("wk")),
        _ => workspace.id.to_string(),
    };
    let trimmed_name = workspace.name.trim();
    sqlx::query!(
        r#"
            INSERT INTO workspaces (
                id,
                name,
                description,
                variables,
                setting_request_timeout,
                setting_follow_redirects,
                setting_validate_certificates
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
    .execute(pool)
    .await?;

    get_workspace(&id, pool).await
}

pub async fn update_response(
    response: &HttpResponse,
    pool: &Pool<Sqlite>,
) -> Result<HttpResponse, sqlx::Error> {
    let headers_json = Json(&response.headers);
    sqlx::query!(
        r#"
            UPDATE http_responses SET (
                elapsed,
                url,
                status,
                status_reason,
                content_length,
                body_path,
                error,
                headers,
                updated_at
            ) = (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) WHERE id = ?;
        "#,
        response.elapsed,
        response.url,
        response.status,
        response.status_reason,
        response.content_length,
        response.body_path,
        response.error,
        headers_json,
        response.id,
    )
    .execute(pool)
    .await?;
    get_response(&response.id, pool).await
}

pub async fn get_response(id: &str, pool: &Pool<Sqlite>) -> Result<HttpResponse, sqlx::Error> {
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT id, model, workspace_id, request_id, updated_at, created_at, url,
                status, status_reason, content_length, body_path, elapsed, error,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

pub async fn find_responses(
    request_id: &str,
    limit: Option<i64>,
    pool: &Pool<Sqlite>,
) -> Result<Vec<HttpResponse>, sqlx::Error> {
    let limit_unwrapped = match limit {
        Some(l) => l,
        None => i64::MAX,
    };
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT id, model, workspace_id, request_id, updated_at, created_at, url,
                status, status_reason, content_length, body_path, elapsed, error,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE request_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        "#,
        request_id,
        limit_unwrapped,
    )
    .fetch_all(pool)
    .await
}

pub async fn find_responses_by_workspace_id(
    workspace_id: &str,
    pool: &Pool<Sqlite>,
) -> Result<Vec<HttpResponse>, sqlx::Error> {
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT id, model, workspace_id, request_id, updated_at, created_at, url,
                status, status_reason, content_length, body_path, elapsed, error,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE workspace_id = ?
            ORDER BY created_at DESC
        "#,
        workspace_id,
    )
    .fetch_all(pool)
    .await
}

pub async fn delete_response(id: &str, pool: &Pool<Sqlite>) -> Result<HttpResponse, sqlx::Error> {
    let resp = get_response(id, pool).await?;

    // Delete the body file if it exists
    if let Some(p) = resp.body_path.clone() {
        if let Err(e) = fs::remove_file(p) {
            println!("Failed to delete body file: {}", e);
        };
    }

    let _ = sqlx::query!(
        r#"
            DELETE FROM http_responses
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;

    Ok(resp)
}

pub async fn delete_all_responses(
    request_id: &str,
    pool: &Pool<Sqlite>,
) -> Result<(), sqlx::Error> {
    for r in find_responses(request_id, None, pool).await? {
        delete_response(&r.id, pool).await?;
    }
    Ok(())
}

pub fn generate_id(prefix: Option<&str>) -> String {
    let id = Alphanumeric.sample_string(&mut rand::thread_rng(), 10);
    match prefix {
        None => id,
        Some(p) => format!("{p}_{id}"),
    }
}

#[derive(Default, Debug, Deserialize, Serialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkspaceExport {
    yaak_version: String,
    yaak_schema: i64,
    timestamp: NaiveDateTime,
    resources: WorkspaceExportResources,
}

#[derive(Default, Debug, Deserialize, Serialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkspaceExportResources {
    workspaces: Vec<Workspace>,
    environments: Vec<Environment>,
    folders: Vec<Folder>,
    requests: Vec<HttpRequest>,
}

pub async fn get_workspace_export_resources(
    app_handle: &AppHandle,
    pool: &Pool<Sqlite>,
    workspace_id: &str,
) -> WorkspaceExport {
    let workspace = get_workspace(workspace_id, pool)
        .await
        .expect("Failed to get workspace");
    return WorkspaceExport {
        yaak_version: app_handle.package_info().version.clone().to_string(),
        yaak_schema: 1,
        timestamp: chrono::Utc::now().naive_utc(),
        resources: WorkspaceExportResources {
            workspaces: vec![workspace],
            environments: find_environments(workspace_id, pool)
                .await
                .expect("Failed to get environments"),
            folders: find_folders(workspace_id, pool)
                .await
                .expect("Failed to get folders"),
            requests: find_requests(workspace_id, pool)
                .await
                .expect("Failed to get requests"),
        },
    };
}
