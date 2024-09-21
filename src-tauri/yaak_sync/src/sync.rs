use crate::error;
use crate::sync_object::{SyncObject, SyncObjectMetadata};
use base64::prelude::BASE64_STANDARD;
use base64::Engine;
use chrono::NaiveDateTime;
use error::Result;
use hex;
use serde::Serialize;
use serde_json::to_vec_pretty;
use sha1::{Digest, Sha1};

pub fn model_to_sync_object<M: Serialize>(m: M) -> Result<SyncObject> {
    let v = serde_json::to_value(&m)?;
    let v = v.as_object().unwrap().to_owned();

    // Extract these fields to store on the sync object
    let model: String = serde_json::from_value(v.get("model").unwrap().to_owned())?;
    let id: String = serde_json::from_value(v.get("id").unwrap().to_owned())?;
    let created_at: NaiveDateTime = serde_json::from_value(v.get("createdAt").unwrap().to_owned())?;
    let updated_at: NaiveDateTime = serde_json::from_value(v.get("updatedAt").unwrap().to_owned())?;

    let data = BASE64_STANDARD.encode(to_vec_pretty(&v)?);

    Ok(SyncObject {
        data,
        metadata: SyncObjectMetadata {
            hash: model_hash(m),
            id,
            model,
            created_at,
            updated_at,
        },
    })
}

pub fn model_hash<M: Serialize>(m: M) -> String {
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
            model: "http_request".to_string(),
            created_at: Utc::now().sub(TimeDelta::seconds(1234567)).naive_utc(),
            updated_at: Utc::now().naive_utc(),
            authentication: auth,
            ..Default::default()
        }
    }

    #[test]
    fn test_debug() {
        let so = model_to_sync_object(debug_http_request()).unwrap();
        println!("{}", serde_json::to_string_pretty(&so.metadata).unwrap());
    }

    #[test]
    fn test_model_hash_determinism() {
        for _i in 1..1000 {
            assert_eq!(
                model_hash(debug_http_request()),
                model_hash(debug_http_request()),
            );
        }
    }

    #[test]
    fn test_model_hash_ignore_updated_at() {
        let r1 = debug_http_request();
        let mut r2 = r1.clone();
        r2.updated_at = r2.updated_at.add(TimeDelta::seconds(999));

        assert_eq!(model_hash(r1), model_hash(r2),);
    }

    #[test]
    fn test_model_hash_different() {
        let r1 = debug_http_request();
        let mut r2 = r1.clone();
        r2.name = "Different".to_string();

        assert_ne!(model_hash(r1), model_hash(r2),);
    }
}
