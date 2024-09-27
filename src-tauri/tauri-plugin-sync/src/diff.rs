use crate::error::Result;
use crate::queries::{query_branch_by_name, query_commit, query_objects, upsert_branch};
use crate::sync::model_hash;
use crate::{SyncBranch, SyncModel, SyncObject};
use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime, WebviewWindow};
use ts_rs::TS;
use yaak_models::queries::{
    generate_model_id_with_prefix, get_workspace, list_environments, list_folders,
    list_grpc_requests, list_http_requests,
};

impl SyncChange {
    pub fn new(prev: Option<SyncObject>, next: Option<SyncModel>) -> Self {
        Self {
            prev: prev.map(|o| serde_json::from_slice(o.data.as_slice()).unwrap()),
            next: next.map(|m| SyncChangeItem {
                hash: model_hash(&m),
                model: m,
            }),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(rename_all = "camelCase")]
pub struct SyncChange {
    prev: Option<SyncChangeItem>,
    next: Option<SyncChangeItem>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "sync.ts")]
#[serde(rename_all = "camelCase")]
pub struct SyncChangeItem {
    pub hash: String,
    pub model: SyncModel,
}

pub async fn compute_changes<R: Runtime>(
    window: &WebviewWindow<R>,
    workspace_id: &str,
    branch: &str,
) -> Result<Vec<SyncChange>> {
    let branch = match query_branch_by_name(window.app_handle(), workspace_id, branch).await {
        Ok(b) => b,
        Err(_) => {
            upsert_branch(
                window,
                SyncBranch {
                    id: generate_model_id_with_prefix("sb"),
                    name: branch.to_string(),
                    workspace_id: workspace_id.to_string(),
                    ..Default::default()
                },
            )
            .await?
        }
    };

    let prev_objects = match branch.commit_ids.last() {
        None => Vec::new(),
        Some(commit_id) => {
            let prev_commit = query_commit(window.app_handle(), commit_id.as_str()).await?;
            query_objects(window.app_handle(), prev_commit.object_ids).await?
        }
    };

    let mut curr_changes: Vec<SyncChange> = Vec::new();
    let mut append_models = |models: Vec<SyncModel>| {
        for m in models {
            let prev_object = prev_objects.iter().find(|o| o.model_id == m.model_id());
            curr_changes.push(SyncChange::new(prev_object.map(|o| o.to_owned()), Some(m)));
        }
    };

    append_models(vec![SyncModel::Workspace(
        get_workspace(window.app_handle(), workspace_id).await?,
    )]);

    append_models(
        list_environments(window.app_handle(), workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::Environment(m.to_owned()))
            .collect(),
    );

    append_models(
        list_folders(window.app_handle(), workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::Folder(m.to_owned()))
            .collect(),
    );

    append_models(
        list_http_requests(window.app_handle(), workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::HttpRequest(m.to_owned()))
            .collect(),
    );

    append_models(
        list_grpc_requests(window.app_handle(), workspace_id)
            .await?
            .iter()
            .map(|m| SyncModel::GrpcRequest(m.to_owned()))
            .collect(),
    );

    Ok(curr_changes)
}
