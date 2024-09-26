use crate::diff::{calculate_sync_objects, SyncDiff};
use crate::error::Result;
use crate::models::*;
use sea_query::{Query, SqliteQueryBuilder};
use sea_query_rusqlite::RusqliteBinder;
use tauri::{command, Manager, Runtime, WebviewWindow};
use yaak_models::plugin::SqliteConnection;
use yaak_models::queries::emit_upserted_model;

#[command]
pub async fn diff<R: Runtime>(
    window: WebviewWindow<R>,
    workspace_id: &str,
) -> Result<Vec<SyncDiff>> {
    calculate_sync_objects(&window.app_handle(), workspace_id).await
}

#[command]
pub async fn commit<R: Runtime>(window: WebviewWindow<R>, sync_commit: SyncCommit) -> Result<()> {
    let dbm = &*window.app_handle().state::<SqliteConnection>();
    let db = dbm.0.lock().await.get().unwrap();

    let (sql, params) = Query::insert()
        .into_table(SyncCommitIden::Table)
        .columns([
            SyncCommitIden::Id,
            SyncCommitIden::WorkspaceId,
            SyncCommitIden::Branch,
            SyncCommitIden::Message,
            SyncCommitIden::ModelIds,
        ])
        .values_panic([
            sync_commit.generate_id().into(),
            sync_commit.workspace_id.into(),
            sync_commit.branch.into(),
            sync_commit.message.as_ref().map(|s| s.as_str()).into(),
            serde_json::to_string(&sync_commit.model_ids)?.into(),
        ])
        .returning_all()
        .build_rusqlite(SqliteQueryBuilder);

    let mut stmt = db.prepare(sql.as_str())?;
    let m = stmt.query_row(&*params.as_params(), |row| row.try_into())?;
    Ok(emit_upserted_model(&window, m))
}
