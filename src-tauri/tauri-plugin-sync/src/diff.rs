use crate::error::Result;
use serde::Serialize;
use tauri::{AppHandle, Runtime};
use ts_rs::TS;
use yaak_models::queries::{
    get_workspace, list_environments, list_folders, list_grpc_requests, list_http_requests,
};
use crate::SyncModel;

impl SyncDiff {
    pub fn new(prev: Option<SyncModel>, next: Option<SyncModel>) -> Option<Self> {
        match (prev, next) {
            (Some(model), None) => Some(SyncDiff::Removed { model }),
            (None, Some(model)) => Some(SyncDiff::Added { model }),
            (Some(prev), Some(model)) => Some(SyncDiff::Modified { prev, model }),
            (None, None) => None,
        }
    }
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum SyncDiff {
    Unmodified { model: SyncModel },
    Removed { model: SyncModel },
    Modified { prev: SyncModel, model: SyncModel },
    Added { model: SyncModel },
}

pub async fn calculate_sync_objects<R: Runtime>(
    app_handle: &AppHandle<R>,
    workspace_id: &str,
) -> Result<Vec<SyncDiff>> {
    let todo_prev_objects: Vec<SyncModel> = Vec::new();
    let mut objects: Vec<SyncDiff> = Vec::new();

    let mut append_models = |models: Vec<SyncModel>| {
        for m in models {
            let prev_object = todo_prev_objects
                .iter()
                .find(|o| o.model_id() == m.model_id());
            if let Some(d) = SyncDiff::new(prev_object.map(|m| m.to_owned()), Some(m)) {
                objects.push(d);
            }
        }
    };

    append_models(vec![SyncModel::Workspace(
        get_workspace(app_handle, workspace_id).await?,
    )]);

    append_models(
        list_environments(app_handle, workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::Environment(m.to_owned()))
            .collect(),
    );

    append_models(
        list_folders(app_handle, workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::Folder(m.to_owned()))
            .collect(),
    );

    append_models(
        list_http_requests(app_handle, workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::HttpRequest(m.to_owned()))
            .collect(),
    );

    append_models(
        list_grpc_requests(app_handle, workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::GrpcRequest(m.to_owned()))
            .collect(),
    );

    Ok(objects)
}
