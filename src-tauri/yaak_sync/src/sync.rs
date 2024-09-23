use crate::sync_object::{SyncModel, SyncObject, SyncObjectMetadata};
use base64::prelude::BASE64_STANDARD;
use base64::Engine;
use hex;
use serde_json::to_vec_pretty;
use sha1::{Digest, Sha1};

pub fn model_to_sync_object(m: SyncModel) -> SyncObject {
    let v = serde_json::to_value(&m).unwrap();
    let v = v.as_object().unwrap().to_owned();
    let hash = model_hash(&m);

    let metadata = match m {
        SyncModel::Workspace(m) => SyncObjectMetadata {
            hash,
            id: m.id,
            model: m.model,
            created_at: m.created_at,
            updated_at: m.updated_at,
            workspace_id: None,
            folder_id: None,
            name: Some(m.name),
        },
        SyncModel::Environment(m) => SyncObjectMetadata {
            hash,
            id: m.id,
            model: m.model,
            created_at: m.created_at,
            updated_at: m.updated_at,
            workspace_id: Some(m.workspace_id),
            folder_id: None,
            name: Some(m.name),
        },
        SyncModel::Folder(m) => SyncObjectMetadata {
            hash,
            id: m.id,
            model: m.model,
            created_at: m.created_at,
            updated_at: m.updated_at,
            workspace_id: Some(m.workspace_id),
            folder_id: m.folder_id,
            name: Some(m.name),
        },
        SyncModel::HttpRequest(m) => SyncObjectMetadata {
            hash,
            id: m.id,
            model: m.model,
            created_at: m.created_at,
            updated_at: m.updated_at,
            workspace_id: Some(m.workspace_id),
            folder_id: m.folder_id,
            name: Some(m.name),
        },
        SyncModel::GrpcRequest(m) => SyncObjectMetadata {
            hash,
            id: m.id,
            model: m.model,
            created_at: m.created_at,
            updated_at: m.updated_at,
            workspace_id: Some(m.workspace_id),
            folder_id: m.folder_id,
            name: Some(m.name),
        },
    };

    let data = BASE64_STANDARD.encode(to_vec_pretty(&v).unwrap());
    SyncObject { data, metadata }
}

pub fn model_hash(m: &SyncModel) -> String {
    let value = serde_json::to_value(&m).unwrap();
    let mut value = value.as_object().unwrap().to_owned();

    // Remove fields we don't want to be in the final model
    value.remove("createdAt");
    value.remove("updatedAt");

    let model_bytes = to_vec_pretty(&value).unwrap();

    let mut hasher = Sha1::new();
    hasher.update(&model_bytes);
    hex::encode(hasher.finalize())
}

#[cfg(test)]
mod tests {
    use crate::sync::{model_hash, model_to_sync_object};
    use crate::sync_object::SyncModel;
    use chrono::{TimeDelta, Utc};
    use serde_json::json;
    use std::collections::BTreeMap;
    use std::ops::{Add, Sub};
    use yaak_models::models::HttpRequest;

    fn debug_http_request() -> HttpRequest {
        let mut auth = BTreeMap::new();
        auth.insert("zzz".into(), json!("bar"));
        auth.insert("foo".into(), json!("bar"));
        auth.insert("baz".into(), json!("bar"));
        auth.insert("bar".into(), json!("bar"));
        HttpRequest {
            id: "req_123".to_string(),
            name: "My Request".to_string(),
            created_at: Utc::now().sub(TimeDelta::seconds(1234567)).naive_utc(),
            updated_at: Utc::now().naive_utc(),
            workspace_id: "wk_123".to_string(),
            folder_id: Some("fl_345".to_string()),
            authentication: auth,
            ..Default::default()
        }
    }

    #[test]
    fn test_debug() {
        let so = model_to_sync_object(SyncModel::HttpRequest(debug_http_request()));
        println!("{}", serde_json::to_string_pretty(&so.metadata).unwrap());
    }

    #[test]
    fn test_model_hash_determinism() {
        for _i in 1..1000 {
            assert_eq!(
                model_hash(&SyncModel::HttpRequest(debug_http_request())),
                model_hash(&SyncModel::HttpRequest(debug_http_request())),
            );
        }
    }

    #[test]
    fn test_model_hash_ignore_updated_at() {
        let r1 = debug_http_request();
        let mut r2 = r1.clone();
        r2.updated_at = r2.updated_at.add(TimeDelta::seconds(999));

        assert_eq!(
            model_hash(&SyncModel::HttpRequest(r1)),
            model_hash(&SyncModel::HttpRequest(r2)),
        );
    }

    #[test]
    fn test_model_hash_different() {
        let r1 = debug_http_request();
        let mut r2 = r1.clone();
        r2.name = "Different".to_string();

        assert_ne!(
            model_hash(&SyncModel::HttpRequest(r1)),
            model_hash(&SyncModel::HttpRequest(r2)),
        );
    }
}
