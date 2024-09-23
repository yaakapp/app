use crate::error::Result;
use crate::sync::model_to_sync_object;
use crate::sync_object::{SyncModel, SyncObject};
use serde::Serialize;
use tauri::{AppHandle, Runtime};
use ts_rs::TS;
use yaak_models::queries::{
    get_workspace, list_environments, list_folders, list_grpc_requests, list_http_requests,
};

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
    status: SyncStatus,
    object: SyncObject,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(rename_all = "snake_case")]
pub enum SyncStatus {
    Untracked,
    Unmodified,
    Modified,
    Staged,
}

pub async fn generate_stage<R: Runtime>(
    app_handle: &AppHandle<R>,
    workspace_id: &str,
) -> Result<Stage> {
    let mut objects = Vec::new();

    objects.push(StageObject {
        status: SyncStatus::Untracked,
        object: model_to_sync_object(SyncModel::Workspace(
            get_workspace(app_handle, workspace_id).await?,
        )),
    });

    objects.append(
        &mut list_environments(app_handle, workspace_id)
            .await?
            .iter()
            .cloned()
            .map(|f| StageObject {
                status: SyncStatus::Untracked,
                object: model_to_sync_object(SyncModel::Environment(f)),
            })
            .collect::<Vec<StageObject>>(),
    );

    objects.append(
        &mut list_folders(app_handle, workspace_id)
            .await?
            .iter()
            .cloned()
            .map(|f| StageObject {
                status: SyncStatus::Untracked,
                object: model_to_sync_object(SyncModel::Folder(f)),
            })
            .collect::<Vec<StageObject>>(),
    );

    objects.append(
        &mut list_http_requests(app_handle, workspace_id)
            .await?
            .iter()
            .cloned()
            .map(|f| StageObject {
                status: SyncStatus::Untracked,
                object: model_to_sync_object(SyncModel::HttpRequest(f)),
            })
            .collect::<Vec<StageObject>>(),
    );

    objects.append(
        &mut list_grpc_requests(app_handle, workspace_id)
            .await?
            .iter()
            .cloned()
            .map(|f| StageObject {
                status: SyncStatus::Untracked,
                object: model_to_sync_object(SyncModel::GrpcRequest(f)),
            })
            .collect::<Vec<StageObject>>(),
    );

    Ok(Stage { objects })
}
