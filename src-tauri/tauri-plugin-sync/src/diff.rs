use crate::error::Result;
use crate::queries::{query_branch_by_name, query_commit, query_objects, upsert_branch};
use crate::{find_all_models, SyncBranch, SyncModel, SyncObject};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};
use tauri::{Manager, Runtime, WebviewWindow};
use ts_rs::TS;
use yaak_models::queries::generate_model_id_with_prefix;

impl SyncChange {
    pub fn new(prev: Option<SyncObject>, next: Option<SyncModel>) -> Self {
        Self {
            // TODO: This fails because it's not a sync model being stored?
            prev: prev.map(|o| {
                let model = serde_json::from_slice::<SyncModel>(o.data.as_slice()).unwrap();
                SyncChangeItem {
                    object_id: o.id,
                    model,
                }
            }),
            next: next.map(|m| {
                let o: SyncObject = m.to_owned().into();
                SyncChangeItem {
                    object_id: o.id,
                    model: m,
                }
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
    pub object_id: String,
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
            let b = SyncBranch {
                id: generate_model_id_with_prefix("sb"),
                name: branch.to_string(),
                workspace_id: workspace_id.to_string(),
                ..Default::default()
            };
            upsert_branch(window, b).await?
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

    let all_models = find_all_models(window.app_handle(), workspace_id).await?;

    // 1. Add all new, modified, and unmodified objects
    for m in all_models.clone() {
        let prev_object = prev_objects.iter().find(|o| o.model_id == m.model_id());
        curr_changes.push(SyncChange::new(prev_object.map(|o| o.to_owned()), Some(m)));
    }

    // 2. Add deleted objects
    for prev in prev_objects {
        let curr_model = all_models.iter().find(|m| m.model_id() == prev.model_id);
        if curr_model.is_none() {
            // Object from the last commit doesn't exist in all models, so it must have
            // been deleted.
            curr_changes.push(SyncChange::new(Some(prev), None));
        }
    }

    Ok(curr_changes)
}

struct StageNode {
    pub model: SyncModel,
    pub children: Vec<StageNode>,
    pub status: StageStatus,
    object_id: String,
    depth: u8,
}

#[derive(Debug, Eq, PartialEq)]
enum StageStatus {
    Unmodified,
    Modified,
    Untracked,
    Removed,
}

impl StageNode {
    fn new(
        model_id: &str,
        prev_objects: &Vec<SyncObject>,
        curr_models: &Vec<SyncModel>,
        depth: u8,
    ) -> Self {
        let prev = prev_objects.iter().find(|o| o.model_id == model_id);
        let next: Option<SyncObject> = curr_models
            .iter()
            .find_map(|o| (o.model_id() == model_id).then(|| o.to_owned().into()));
        let (object, status) = match (prev, next) {
            (Some(prev), Some(next)) => (
                next.clone(),
                if prev.id == next.id {
                    StageStatus::Unmodified
                } else {
                    StageStatus::Modified
                },
            ),
            (Some(prev), None) => (prev.to_owned(), StageStatus::Removed),
            (None, Some(next)) => (next, StageStatus::Untracked),
            (None, None) => panic!("Should never find prev/next == None"),
        };

        let model: SyncModel = object.clone().into();

        let mut all_children: Vec<SyncObject> = Vec::new();
        all_children.append(
            &mut prev_objects
                .iter()
                .filter(|o| {
                    curr_models
                        .iter()
                        .find(|m| m.model_id() == o.model_id)
                        .is_none()
                })
                .filter_map(|o| {
                    let o = o.to_owned().to_owned();
                    let m: SyncModel = o.clone().into();
                    m.is_child_of(&model).then_some(o)
                })
                .collect(),
        );
        all_children.append(
            &mut curr_models
                .iter()
                .filter(|m| m.is_child_of(&model))
                .map(|m| m.to_owned().into())
                .collect(),
        );

        Self {
            model: model.clone(),
            status,
            depth,
            object_id: object.id,
            children: all_children
                .iter()
                .map(|o| {
                    StageNode::new(o.model_id.as_str(), &prev_objects, &curr_models, depth + 1)
                })
                .collect(),
        }
    }
}

impl Display for StageNode {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let indent = std::iter::repeat("· ")
            .take(self.depth as usize)
            .collect::<String>();
        f.write_fmt(format_args!(
            "{indent} id={} hash={}",
            self.model.model_id(),
            self.object_id[..6].to_string(),
        ))?;
        for child in self.children.iter() {
            f.write_fmt(format_args!("\n{}", child))?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use crate::diff::{StageNode, StageStatus};
    use crate::{SyncModel, SyncObject};
    use yaak_models::models::{Folder, GrpcRequest, HttpRequest, Workspace};

    #[test]
    fn gen_tree() {
        let workspace_id = "wk_1".to_string();

        let model_wk_1 = Workspace {
            model: "workspace".into(),
            id: workspace_id.clone(),
            name: "Workspace".into(),
            ..Default::default()
        };

        let model_fl_1 = Folder {
            model: "folder".into(),
            id: "fl_1".into(),
            name: "Folder 1".into(),
            workspace_id: workspace_id.to_owned(),
            ..Default::default()
        };

        let model_fl_2 = Folder {
            model: "folder".into(),
            id: "fl_2".into(),
            name: "Folder 2".into(),
            workspace_id: workspace_id.to_owned(),
            ..Default::default()
        };

        let model_fl_1_1 = Folder {
            model: "folder".into(),
            id: "fl_1_1".into(),
            name: "Folder 1 / 1".into(),
            folder_id: Some(model_fl_1.clone().id),
            workspace_id: workspace_id.to_owned(),
            ..Default::default()
        };

        let model_rq_1 = HttpRequest {
            model: "http_request".into(),
            id: "hr_1".into(),
            name: "Http Request 1".into(),
            folder_id: Some(model_fl_1_1.clone().id),
            workspace_id: workspace_id.to_owned(),
            ..Default::default()
        };

        let model_rq_1_modified = HttpRequest {
            name: format!("{} Modified", model_rq_1.name),
            ..model_rq_1.clone()
        };

        let model_rq_2_added = HttpRequest {
            model: "http_request".into(),
            id: "hr_2".into(),
            name: "Http Request 2".into(),
            workspace_id: workspace_id.to_owned(),
            ..Default::default()
        };

        let model_gr_1 = GrpcRequest {
            model: "grpc_request".into(),
            id: "gr_1".into(),
            name: "Grpc Request 1".into(),
            workspace_id: workspace_id.to_owned(),
            ..Default::default()
        };

        let prev_objects = vec![
            SyncModel::HttpRequest(model_rq_1.clone()),
            SyncModel::GrpcRequest(model_gr_1.clone()),
            SyncModel::Folder(model_fl_1.clone()),
            SyncModel::Folder(model_fl_2.clone()),
            SyncModel::Folder(model_fl_1_1.clone()),
            SyncModel::Workspace(model_wk_1.clone()),
        ]
        .iter()
        .map(|m| m.clone().into())
        .collect::<Vec<SyncObject>>();

        let models = vec![
            SyncModel::Workspace(model_wk_1.clone()),
            SyncModel::Folder(model_fl_1.clone()),
            SyncModel::Folder(model_fl_2.clone()),
            SyncModel::Folder(model_fl_1_1.clone()),
            // Modify this one
            SyncModel::HttpRequest(model_rq_1_modified.clone()),
            // Add this one
            SyncModel::HttpRequest(model_rq_2_added.clone()),
            // Delete this one
            // SyncModel::GrpcRequest(model_gr_1.clone()),
        ];

        let wk_1 = StageNode::new(workspace_id.as_str(), &prev_objects, &models, 0);
        println!("TREE{}", wk_1);
        assert_eq!(wk_1.model.model_id(), workspace_id);
        assert_eq!(wk_1.status, StageStatus::Unmodified);
        assert_eq!(wk_1.children.len(), 4);

        let gr_1 = wk_1.children.get(0).unwrap();
        assert_eq!(gr_1.model.model_id(), model_gr_1.id);
        assert_eq!(gr_1.status, StageStatus::Removed);

        let fl_1 = wk_1.children.get(1).unwrap();
        assert_eq!(fl_1.model.model_id(), model_fl_1.id);
        assert_eq!(fl_1.status, StageStatus::Unmodified);
        assert_eq!(fl_1.children.len(), 1);
        assert_eq!(
            fl_1.children.get(0).unwrap().model.model_id(),
            model_fl_1_1.id
        );

        let fl_2 = wk_1.children.get(2).unwrap();
        assert_eq!(fl_2.status, StageStatus::Unmodified);
        assert_eq!(fl_2.model.model_id(), model_fl_2.id);
        assert_eq!(fl_2.children.len(), 0);

        let rq_2_added = wk_1.children.get(3).unwrap();
        assert_eq!(rq_2_added.model.model_id(), model_rq_2_added.id);
        assert_eq!(rq_2_added.status, StageStatus::Untracked);

        let fl_1_1 = fl_1.children.get(0).unwrap();
        assert_eq!(fl_1_1.status, StageStatus::Unmodified);
        assert_eq!(fl_1_1.children.len(), 1);
        assert_eq!(fl_1_1.model.model_id(), model_fl_1_1.id);

        let rq_1 = fl_1_1.children.get(0).unwrap();
        assert_eq!(rq_1.model.model_id(), model_rq_1.id);
        assert_eq!(rq_1.status, StageStatus::Modified);
    }
}
