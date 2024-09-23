use tauri::Runtime;
use crate::sync_object::SyncObject;

pub struct SyncStage {
    status: SyncStatus,
    object: SyncObject,
}

pub enum SyncStatus {
    Untracked,
    Unmodified,
    Modified,
    Staged,
}

// pub async fn generate_stage<R: Runtime>(app_handle: &AppHandle<R>) -> Result<SyncStage, String> {
//     
// }