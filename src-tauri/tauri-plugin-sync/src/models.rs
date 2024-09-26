use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};
use ts_rs::TS;
use yaak_models::models::{json_col, Environment, Folder, GrpcRequest, HttpRequest, Workspace};

#[derive(Debug, Clone, Serialize, Deserialize, Default, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "models.ts")]
pub struct SyncCommit {
    #[ts(type = "\"sync_commit\"")]
    pub model: String,
    /// ID in this model is the commit's hash
    pub id: String,
    pub workspace_id: String,
    pub created_at: NaiveDateTime,

    pub branch: String,
    pub message: Option<String>,
    pub model_ids: Vec<String>,
}

impl SyncCommit {
    pub fn generate_id(&self) -> String {
        let mut hasher = Sha1::new();
        hasher.update(self.branch.as_bytes());
        for id in self.model_ids.iter() {
            hasher.update(id.as_bytes());
        }
        let id = hex::encode(hasher.finalize());
        format!("sc_{id}")
    }
}

#[derive(sea_query::Iden)]
pub enum SyncCommitIden {
    #[iden = "sync_commits"]
    Table,
    Model,
    Id,
    CreatedAt,
    WorkspaceId,

    Branch,
    Message,
    ModelIds,
}

impl<'s> TryFrom<&rusqlite::Row<'s>> for SyncCommit {
    type Error = rusqlite::Error;
    
    fn try_from(r: &rusqlite::Row<'_>) -> Result<Self, Self::Error> {
        Ok(SyncCommit {
            id: r.get("id")?,
            model: r.get("model")?,
            created_at: r.get("created_at")?,
            workspace_id: r.get("workspace_id")?,

            model_ids: json_col(r.get::<_, String>("model_ids")?.as_str()),
            message: r.get("message")?,
            branch: r.get("branch")?,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, TS)]
#[serde(default, rename_all = "camelCase")]
#[ts(export, export_to = "models.ts")]
pub struct SyncObject {
    #[ts(type = "\"sync_object\"")]
    pub model: String,
    /// ID in this model is the model hash
    pub id: String,
    pub created_at: NaiveDateTime,
    pub workspace_id: String,

    pub data: Vec<u8>,
    pub model_id: String,
}

#[derive(sea_query::Iden)]
pub enum SyncObjectIden {
    #[iden = "sync_objects"]
    Table,
    Model,
    Id,
    CreatedAt,
    WorkspaceId,

    Data,
    ModelId,
}

impl<'s> TryFrom<&rusqlite::Row<'s>> for SyncObject {
    type Error = rusqlite::Error;

    fn try_from(r: &rusqlite::Row<'s>) -> Result<Self, Self::Error> {
        Ok(SyncObject {
            id: r.get("id")?,
            model: r.get("model")?,
            created_at: r.get("created_at")?,
            workspace_id: r.get("workspace_id")?,

            data: json_col(r.get::<_, String>("data")?.as_str()),
            model_id: r.get("model_id")?,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case", untagged)]
#[ts(export, export_to = "models.ts")]
pub enum SyncModel {
    Workspace(Workspace),
    Environment(Environment),
    Folder(Folder),
    HttpRequest(HttpRequest),
    GrpcRequest(GrpcRequest),
}

impl SyncModel {
    pub fn model_id(&self) -> String {
        match self {
            SyncModel::Workspace(m) => m.to_owned().id,
            SyncModel::Environment(m) => m.to_owned().id,
            SyncModel::Folder(m) => m.to_owned().id,
            SyncModel::HttpRequest(m) => m.to_owned().id,
            SyncModel::GrpcRequest(m) => m.to_owned().id,
        }
    }
}

