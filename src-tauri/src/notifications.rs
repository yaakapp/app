use std::time::SystemTime;

use chrono::{DateTime, Duration, Utc};
use log::debug;
use reqwest::Method;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use yaak_models::queries::{get_key_value_raw, set_key_value_raw};
use crate::analytics::get_num_launches;

// Check for updates every hour
const MAX_UPDATE_CHECK_SECONDS: u64 = 60 * 60;

const KV_NAMESPACE: &str = "notifications";
const KV_KEY: &str = "seen";

// Create updater struct
pub struct YaakNotifier {
    last_check: SystemTime,
}

#[derive(sqlx::FromRow, Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct YaakNotification {
    timestamp: DateTime<Utc>,
    id: String,
    message: String,
    action: Option<YaakNotificationAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
pub struct YaakNotificationAction {
    label: String,
    url: String,
}

impl YaakNotifier {
    pub fn new() -> Self {
        Self {
            last_check: SystemTime::UNIX_EPOCH,
        }
    }

    pub async fn seen(&mut self, app: &AppHandle, id: &str) -> Result<(), String> {
        let mut seen = get_kv(app).await?;
        seen.push(id.to_string());
        debug!("Marked notification as seen {}", id);
        let seen_json = serde_json::to_string(&seen).map_err(|e| e.to_string())?;
        set_key_value_raw(app, KV_NAMESPACE, KV_KEY, seen_json.as_str()).await;
        Ok(())
    }

    pub async fn check(&mut self, app: &AppHandle) -> Result<(), String> {
        let ignore_check = self.last_check.elapsed().unwrap().as_secs() < MAX_UPDATE_CHECK_SECONDS;

        if ignore_check {
            return Ok(());
        }

        self.last_check = SystemTime::now();

        let num_launches = get_num_launches(app).await;
        let info = app.package_info().clone();
        let req = reqwest::Client::default()
            .request(Method::GET, "https://notify.yaak.app/notifications")
            .query(&[
                ("version", info.version.to_string()),
                ("launches", num_launches.to_string()),
            ]);
        let resp = req.send().await.map_err(|e| e.to_string())?;
        if resp.status() != 200 {
            debug!("Skipping notification status code {}", resp.status());
            return Ok(());
        }

        let notification = resp
            .json::<YaakNotification>()
            .await
            .map_err(|e| e.to_string())?;

        let age = notification.timestamp.signed_duration_since(Utc::now());
        let seen = get_kv(app).await?;
        if seen.contains(&notification.id) || (age > Duration::days(2)) {
            debug!("Already seen notification {}", notification.id);
            return Ok(());
        }
        debug!("Got notification {:?}", notification);

        let _ = app.emit("notification", notification.clone());

        Ok(())
    }
}

async fn get_kv(app: &AppHandle) -> Result<Vec<String>, String> {
    match get_key_value_raw(app, "notifications", "seen").await {
        None => Ok(Vec::new()),
        Some(v) => serde_json::from_str(&v.value).map_err(|e| e.to_string()),
    }
}
