use log::{debug, warn};
use serde::{Deserialize, Serialize};
use sqlx::types::JsonValue;
use tauri::{async_runtime, AppHandle, Manager};

use crate::is_dev;

// serializable
#[derive(Serialize, Deserialize)]
pub enum AnalyticsResource {
    App,
    Workspace,
    Environment,
    Folder,
    HttpRequest,
    HttpResponse,
}

#[derive(Serialize, Deserialize)]
pub enum AnalyticsAction {
    Launch,
    Create,
    Update,
    Upsert,
    Delete,
    DeleteMany,
    Send,
    Duplicate,
}

fn resource_name(resource: AnalyticsResource) -> &'static str {
    match resource {
        AnalyticsResource::App => "app",
        AnalyticsResource::Workspace => "workspace",
        AnalyticsResource::Environment => "environment",
        AnalyticsResource::Folder => "folder",
        AnalyticsResource::HttpRequest => "http_request",
        AnalyticsResource::HttpResponse => "http_response",
    }
}

fn action_name(action: AnalyticsAction) -> &'static str {
    match action {
        AnalyticsAction::Launch => "launch",
        AnalyticsAction::Create => "create",
        AnalyticsAction::Update => "update",
        AnalyticsAction::Upsert => "upsert",
        AnalyticsAction::Delete => "delete",
        AnalyticsAction::DeleteMany => "delete_many",
        AnalyticsAction::Send => "send",
        AnalyticsAction::Duplicate => "duplicate",
    }
}

pub fn track_event_blocking(
    app_handle: &AppHandle,
    resource: AnalyticsResource,
    action: AnalyticsAction,
    attributes: Option<JsonValue>,
) {
    async_runtime::block_on(async move {
        track_event(app_handle, resource, action, attributes).await;
    });
}

pub async fn track_event(
    app_handle: &AppHandle,
    resource: AnalyticsResource,
    action: AnalyticsAction,
    attributes: Option<JsonValue>,
) {
    let event = format!("{}.{}", resource_name(resource), action_name(action));
    let attributes_json = attributes.unwrap_or("{}".to_string().into()).to_string();
    let info = app_handle.package_info();
    let tz = datetime::sys_timezone().unwrap_or("unknown".to_string());
    let site = match is_dev() {
        true => "site_TkHWjoXwZPq3HfhERb",
        false => "site_zOK0d7jeBy2TLxFCnZ",
    };
    let base_url = match is_dev() {
        true => "http://localhost:7194",
        false => "https://t.yaak.app"
    };
    let params = vec![
        ("e", event.clone()),
        ("a", attributes_json.clone()),
        ("id", site.to_string()),
        ("v", info.version.clone().to_string()),
        ("os", get_os().to_string()),
        ("tz", tz),
        ("xy", get_window_size(app_handle)),
    ];
    let req = reqwest::Client::builder()
        .build()
        .unwrap()
        .get(format!("{base_url}/t/e"))
        .query(&params);

    if let Err(e) = req.send().await {
        warn!(
                "Error sending analytics event: {} {} {:?}",
                e, event, params
            );
    } else {
        debug!("Send event: {}: {:?}", event, params);
    }
}

fn get_os() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else {
        "unknown"
    }
}

fn get_window_size(app_handle: &AppHandle) -> String {
    let window = match app_handle.windows().into_values().next() {
        Some(w) => w,
        None => return "unknown".to_string(),
    };

    let current_monitor = match window.current_monitor() {
        Ok(Some(m)) => m,
        _ => return "unknown".to_string(),
    };

    let scale_factor = current_monitor.scale_factor();
    let size = current_monitor.size();
    let width: f64 = size.width as f64 / scale_factor;
    let height: f64 = size.height as f64 / scale_factor;

    format!(
        "{}x{}",
        (width / 100.0).round() * 100.0,
        (height / 100.0).round() * 100.0
    )
}
