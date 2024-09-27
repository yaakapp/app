use crate::diff::{compute_changes, SyncChange, SyncChangeItem};
use crate::error::Result;
use crate::models::*;
use crate::queries::{
    insert_commit, insert_object, query_branch_by_name, query_object, upsert_branch,
};
use serde::{Deserialize, Serialize};
use tauri::{command, Manager, Runtime, WebviewWindow};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "commands.ts")]
#[serde(rename_all = "camelCase")]
pub struct ChangesPayload {
    workspace_id: String,
    branch: String,
}

#[command]
pub async fn changes<R: Runtime>(
    window: WebviewWindow<R>,
    payload: ChangesPayload,
) -> Result<Vec<SyncChange>> {
    compute_changes(
        &window,
        payload.workspace_id.as_str(),
        payload.branch.as_str(),
    )
    .await
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "commands.ts")]
#[serde(rename_all = "camelCase")]
pub struct CommitPayload {
    workspace_id: String,
    message: String,
    branch: String,
    change_items: Vec<SyncChangeItem>,
}

#[command]
pub async fn commit<R: Runtime>(window: WebviewWindow<R>, payload: CommitPayload) -> Result<()> {
    // Ensure all objects exist in the DB
    let mut object_ids = Vec::new();
    for i in payload.change_items {
        let obj: SyncObject = i.model.into();
        let obj_id = obj.id.clone();
        object_ids.push(obj_id.clone());
        if let Err(_) = query_object(window.app_handle(), obj_id.as_str()).await {
            println!(
                "INSERTING OBJECT {} {} {:?}",
                obj.model_id,
                obj.model_model,
                serde_json::from_slice::<SyncModel>(obj.data.as_slice())?
            );
            insert_object(&window, obj).await?;
        }
    }

    // Insert the commit
    println!("INSERTING COMMIT {:?}", object_ids);
    let commit = insert_commit(
        &window,
        SyncCommit {
            workspace_id: payload.workspace_id.clone().into(),
            message: payload.message.into(),
            object_ids,
            ..Default::default()
        },
    )
    .await?;

    let mut branch = query_branch_by_name(
        window.app_handle(),
        payload.workspace_id.as_str(),
        payload.branch.as_str(),
    )
    .await?;
    branch.commit_ids.push(commit.id);
    upsert_branch(&window, branch).await?;

    Ok(())
}
