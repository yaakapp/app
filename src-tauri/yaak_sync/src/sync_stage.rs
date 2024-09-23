use serde::Serialize;
use crate::error::Result;
use crate::sync::model_to_sync_object;
use crate::sync_object::{Object, SyncModel};
use tauri::{AppHandle, Runtime};
use ts_rs::TS;
use yaak_models::queries::get_workspace;

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(default, rename_all = "camelCase")]
pub struct Stage {
    objects: Vec<StageObject>,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(default, rename_all = "camelCase")]
pub struct StageObject {
    status: ObjectStatus,
    object: Object,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(rename_all = "snake_case")]
pub enum ObjectStatus {
    Untracked,
    Unmodified,
    Modified,
    Staged,
}

pub async fn generate_stage<R: Runtime>(
    app_handle: &AppHandle<R>,
    workspace_id: &str,
) -> Result<Stage> {
    let workspace = get_workspace(app_handle, workspace_id).await?;
    let mut objects = Vec::new();

    objects.push(StageObject {
        status: ObjectStatus::Untracked,
        object: model_to_sync_object(SyncModel::Workspace(workspace))?,
    });

    Ok(Stage { objects })
}
