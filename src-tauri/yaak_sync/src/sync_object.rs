use chrono::NaiveDateTime;
use serde::Serialize;
use ts_rs::TS;

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(default, rename_all = "camelCase")]
pub struct SyncObject {
    pub metadata: SyncObjectMetadata,
    pub data: String,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
pub struct SyncObjectMetadata {
    pub hash: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub id: String,
    pub model: String,
}