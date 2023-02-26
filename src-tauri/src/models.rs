use std::collections::HashMap;

use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Serialize};
use sqlx::types::chrono::NaiveDateTime;
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

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
    pub workspace_id: String,
    pub name: String,
    pub url: String,
    pub method: String,
    pub body: Option<String>,
    pub headers: String,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub id: String,
    pub workspace_id: String,
    pub request_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub deleted_at: Option<NaiveDateTime>,
    pub name: String,
    pub status: u16,
    pub status_reason: Option<&'static str>,
    pub body: String,
    pub url: String,
    pub method: String,
    pub elapsed: u128,
    pub elapsed2: u128,
    pub headers: HashMap<String, String>,
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
    let id = generate_id("wrk");
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
    pool: &Pool<Sqlite>,
) -> Result<Request, sqlx::Error> {
    let id = generate_id("wrk");
    sqlx::query!(
        r#"
            INSERT INTO requests (id, workspace_id, name, url, method, body, updated_at, headers)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, '{}')
            ON CONFLICT (id) DO UPDATE SET
               name = excluded.name,
               method = excluded.method,
               body = excluded.body,
               url = excluded.url;
        "#,
        id,
        workspace_id,
        name,
        url,
        method,
        body,
    )
    .execute(pool)
    .await
    .expect("Failed to insert new request");
    get_request(&id, pool).await
}

pub async fn find_requests(
    workspace_id: &str,
    pool: &Pool<Sqlite>,
) -> Result<Vec<Request>, sqlx::Error> {
    sqlx::query_as!(
        Request,
        r#"
            SELECT id, workspace_id, created_at, updated_at, deleted_at, name, url, method, body, headers
            FROM requests
            WHERE workspace_id = ?;
        "#,
        workspace_id,
    )
    .fetch_all(pool)
    .await
}

pub async fn get_request(id: &str, pool: &Pool<Sqlite>) -> Result<Request, sqlx::Error> {
    sqlx::query_as!(
        Request,
        r#"
            SELECT id, workspace_id, created_at, updated_at, deleted_at, name, url, method, body, headers
            FROM requests
            WHERE id = ?
        "#,
        id,
    )
    .fetch_one(pool)
    .await
}

fn generate_id(prefix: &str) -> String {
    format!(
        "{prefix}_{}",
        Alphanumeric.sample_string(&mut rand::thread_rng(), 10)
    )
}
