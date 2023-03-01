use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono::NaiveDateTime;
use sqlx::types::Json;
use sqlx::{Pool, Sqlite};

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequestHeader {
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
    pub workspace_id: String,
    pub name: String,
    pub url: String,
    pub method: String,
    pub body: Option<String>,
    pub headers: Json<Vec<HttpRequestHeader>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponseHeader {
    pub name: String,
    pub value: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub id: String,
    pub workspace_id: String,
    pub request_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
    pub error: Option<String>,
    pub url: String,
    pub elapsed: i64,
    pub status: i64,
    pub status_reason: Option<String>,
    pub body: String,
    pub headers: Json<Vec<HttpResponseHeader>>,
}

pub async fn find_workspaces(pool: &Pool<Sqlite>) -> Result<Vec<Workspace>, sqlx::Error> {
    sqlx::query_as!(
        Workspace,
        r#"
            SELECT id, created_at, updated_at, deleted_at, name, description
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
            SELECT id, created_at, updated_at, deleted_at, name, description
            FROM workspaces
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
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

pub async fn upsert_request(
    id: Option<&str>,
    workspace_id: &str,
    name: &str,
    method: &str,
    body: Option<&str>,
    url: &str,
    headers: Vec<HttpRequestHeader>,
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
    sqlx::query!(
        r#"
            INSERT INTO http_requests (id, workspace_id, name, url, method, body, headers, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
               updated_at = CURRENT_TIMESTAMP,
               name = excluded.name,
               method = excluded.method,
               body = excluded.body,
               url = excluded.url
        "#,
        id,
        workspace_id,
        name,
        url,
        method,
        body,
        headers_json,
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
            SELECT id, workspace_id, created_at, updated_at, deleted_at, name, url, method, body,
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
            SELECT id, workspace_id, created_at, updated_at, deleted_at, name, url, method, body,
                headers AS "headers!: sqlx::types::Json<Vec<HttpRequestHeader>>"
            FROM http_requests
            WHERE id = ?
            ORDER BY created_at DESC
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
            INSERT INTO http_responses (id, request_id, workspace_id, elapsed, url, status, status_reason, body, headers)
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
            SELECT id, workspace_id, request_id, updated_at, deleted_at, created_at,
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
            SELECT id, workspace_id, request_id, updated_at, deleted_at,
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

pub async fn delete_response(id: &str, pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
    let _ = sqlx::query!(
        r#"
            DELETE FROM http_responses
            WHERE id = ?
        "#,
        id,
    )
    .execute(pool)
    .await;

    Ok(())
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
