use std::collections::HashMap;

use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono::NaiveDateTime;
use sqlx::types::{Json, JsonValue};
use sqlx::{Pool, Sqlite};

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    pub id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequestHeader {
    #[serde(default)]
    pub enabled: bool,
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub sort_priority: f64,
    pub workspace_id: String,
    pub name: String,
    pub url: String,
    pub method: String,
    pub body: Option<String>,
    pub body_type: Option<String>,
    pub authentication: Json<HashMap<String, JsonValue>>,
    pub authentication_type: Option<String>,
    pub headers: Json<Vec<HttpRequestHeader>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponseHeader {
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub id: String,
    pub model: String,
    pub workspace_id: String,
    pub request_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub error: Option<String>,
    pub url: String,
    pub elapsed: i64,
    pub status: i64,
    pub status_reason: Option<String>,
    pub body: String,
    pub headers: Json<Vec<HttpResponseHeader>>,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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
) -> Option<KeyValue> {
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

    get_key_value(namespace, key, pool).await
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

pub async fn find_workspaces(pool: &Pool<Sqlite>) -> Result<Vec<Workspace>, sqlx::Error> {
    sqlx::query_as!(
        Workspace,
        r#"
            SELECT id, model, created_at, updated_at, name, description
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
            SELECT id, model, created_at, updated_at, name, description
            FROM workspaces WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

pub async fn delete_workspace(id: &str, pool: &Pool<Sqlite>) -> Result<Workspace, sqlx::Error> {
    let workspace = get_workspace(id, pool)
        .await
        .expect("Failed to get request to delete");
    let _ = sqlx::query!(
        r#"
            DELETE FROM workspaces
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;
    Ok(workspace)
}

pub async fn create_workspace(
    name: &str,
    description: &str,
    pool: &Pool<Sqlite>,
) -> Result<Workspace, sqlx::Error> {
    let id = generate_id("wk");
    sqlx::query!(
        r#"
            INSERT INTO workspaces (id, name, description)
            VALUES (?, ?, ?)
        "#,
        id,
        name,
        description,
    )
    .execute(pool)
    .await
    .expect("Failed to insert new workspace");

    get_workspace(&id, pool).await
}

pub async fn duplicate_request(id: &str, pool: &Pool<Sqlite>) -> Result<HttpRequest, sqlx::Error> {
    let existing = get_request(id, pool)
        .await
        .expect("Failed to get request to duplicate");
    // TODO: Figure out how to make this better
    let b2;
    let body = match existing.body {
        Some(b) => {
            b2 = b;
            Some(b2.as_str())
        }
        None => None,
    };

    upsert_request(
        None,
        existing.workspace_id.as_str(),
        existing.name.as_str(),
        existing.method.as_str(),
        body,
        existing.body_type,
        existing.authentication.0,
        existing.authentication_type,
        existing.url.as_str(),
        existing.headers.0,
        existing.sort_priority,
        pool,
    )
    .await
}

pub async fn upsert_request(
    id: Option<&str>,
    workspace_id: &str,
    name: &str,
    method: &str,
    body: Option<&str>,
    body_type: Option<String>,
    authentication: HashMap<String, JsonValue>,
    authentication_type: Option<String>,
    url: &str,
    headers: Vec<HttpRequestHeader>,
    sort_priority: f64,
    pool: &Pool<Sqlite>,
) -> Result<HttpRequest, sqlx::Error> {
    let generated_id;
    let id = match id {
        Some(v) => v,
        None => {
            generated_id = generate_id("rq");
            generated_id.as_str()
        }
    };
    let headers_json = Json(headers);
    let auth_json = Json(authentication);
    sqlx::query!(
        r#"
            INSERT INTO http_requests (
                id,
                workspace_id,
                name,
                url,
                method,
                body,
                body_type,
                authentication,
                authentication_type,
                headers,
                sort_priority
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               name = excluded.name,
               method = excluded.method,
               headers = excluded.headers,
               body = excluded.body,
               body_type = excluded.body_type,
               authentication = excluded.authentication,
               authentication_type = excluded.authentication_type,
               url = excluded.url,
               sort_priority = excluded.sort_priority
        "#,
        id,
        workspace_id,
        name,
        url,
        method,
        body,
        body_type,
        auth_json,
        authentication_type,
        headers_json,
        sort_priority,
    )
    .execute(pool)
    .await
    .expect("Failed to insert new request");
    get_request(id, pool).await
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
                created_at,
                updated_at,
                name,
                url,
                method,
                body,
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
                created_at,
                updated_at,
                name,
                url,
                method,
                body,
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
    let req = get_request(id, pool)
        .await
        .expect("Failed to get request to delete");
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
    body: &str,
    headers: Vec<HttpResponseHeader>,
    pool: &Pool<Sqlite>,
) -> Result<HttpResponse, sqlx::Error> {
    let req = get_request(request_id, pool)
        .await
        .expect("Failed to get request");
    let id = generate_id("rp");
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
                body,
                headers
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        "#,
        id,
        request_id,
        req.workspace_id,
        elapsed,
        url,
        status,
        status_reason,
        body,
        headers_json,
    )
    .execute(pool)
    .await
    .expect("Failed to insert new response");

    get_response(&id, pool).await
}

pub async fn update_response_if_id(
    response: HttpResponse,
    pool: &Pool<Sqlite>,
) -> Result<HttpResponse, sqlx::Error> {
    if response.id == "" {
        return Ok(response);
    }
    return update_response(response, pool).await;
}

pub async fn update_response(
    response: HttpResponse,
    pool: &Pool<Sqlite>,
) -> Result<HttpResponse, sqlx::Error> {
    let headers_json = Json(response.headers);
    sqlx::query!(
        r#"
            UPDATE http_responses SET (elapsed, url, status, status_reason, body, error, headers, updated_at) =
            (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) WHERE id = ?;
        "#,
        response.elapsed,
        response.url,
        response.status,
        response.status_reason,
        response.body,
        response.error,
        headers_json,
        response.id,
    )
    .execute(pool)
    .await
    .expect("Failed to update response");
    get_response(&response.id, pool).await
}

pub async fn get_response(id: &str, pool: &Pool<Sqlite>) -> Result<HttpResponse, sqlx::Error> {
    sqlx::query_as_unchecked!(
        HttpResponse,
        r#"
            SELECT id, model, workspace_id, request_id, updated_at, created_at,
                status, status_reason, body, elapsed, url, error,
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
    pool: &Pool<Sqlite>,
) -> Result<Vec<HttpResponse>, sqlx::Error> {
    sqlx::query_as!(
        HttpResponse,
        r#"
            SELECT id, model, workspace_id, request_id, updated_at,
                created_at, status, status_reason, body, elapsed, url, error,
                headers AS "headers!: sqlx::types::Json<Vec<HttpResponseHeader>>"
            FROM http_responses
            WHERE request_id = ?
            ORDER BY created_at ASC
        "#,
        request_id,
    )
    .fetch_all(pool)
    .await
}

pub async fn delete_response(id: &str, pool: &Pool<Sqlite>) -> Result<HttpResponse, sqlx::Error> {
    let resp = get_response(id, pool)
        .await
        .expect("Failed to get response to delete");

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
    let _ = sqlx::query!(
        r#"
            DELETE FROM http_responses
            WHERE request_id = ?
        "#,
        request_id,
    )
    .execute(pool)
    .await;

    Ok(())
}

pub fn generate_id(prefix: &str) -> String {
    format!(
        "{prefix}_{}",
        Alphanumeric.sample_string(&mut rand::thread_rng(), 10)
    )
}
