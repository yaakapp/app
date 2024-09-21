use crate::sync_object::SyncObjectMetadata;

pub struct SyncStage {
    status: SyncStatus,
    id: SyncObjectMetadata,
}

pub enum SyncStatus {
    Untracked,
    Unmodified,
    Modified,
    Staged,
}
