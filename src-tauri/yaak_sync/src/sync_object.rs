use chrono::NaiveDateTime;
use serde::Serialize;
use ts_rs::TS;
use yaak_models::models::{Environment, Folder, GrpcRequest, HttpRequest, Workspace};

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(default, rename_all = "camelCase")]
pub struct SyncObject {
    pub metadata: SyncObjectMetadata,
    pub data: String,
}

#[derive(Debug, Default, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
pub struct SyncObjectMetadata {
    pub hash: String,
    pub id: String,
    pub model: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub name: Option<String>,
    pub folder_id: Option<String>,
    pub workspace_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(rename_all = "snake_case", untagged)]
pub enum SyncModel {
    Workspace(Workspace),
    Environment(Environment),
    Folder(Folder),
    HttpRequest(HttpRequest),
    GrpcRequest(GrpcRequest),
}
