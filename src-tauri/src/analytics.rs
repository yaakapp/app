use log::{debug, warn};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::types::JsonValue;
use tauri::{AppHandle, Manager};

use crate::{is_dev, models};

// serializable
#[derive(Serialize, Deserialize)]
pub enum AnalyticsResource {
    App,
    CookieJar,
    Dialog,
    Environment,
    Folder,
    GrpcRequest,
    HttpRequest,
    HttpResponse,
    KeyValue,
    Sidebar,
    Workspace,
}

impl AnalyticsResource {
    pub fn from_str(s: &str) -> Option<AnalyticsResource> {
        match s {
            "App" => Some(AnalyticsResource::App),
            "Dialog" => Some(AnalyticsResource::Dialog),
            "CookieJar" => Some(AnalyticsResource::CookieJar),
            "Environment" => Some(AnalyticsResource::Environment),
            "Folder" => Some(AnalyticsResource::Folder),
            "GrpcRequest" => Some(AnalyticsResource::GrpcRequest),
            "HttpRequest" => Some(AnalyticsResource::HttpRequest),
            "HttpResponse" => Some(AnalyticsResource::HttpResponse),
            "KeyValue" => Some(AnalyticsResource::KeyValue),
            "Sidebar" => Some(AnalyticsResource::Sidebar),
            "Workspace" => Some(AnalyticsResource::Workspace),
            _ => None,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub enum AnalyticsAction {
    Create,
    Delete,
    DeleteMany,
    Duplicate,
    Export,
    Hide,
    Import,
    Launch,
    LaunchFirst,
    LaunchUpdate,
    Send,
    Show,
    Toggle,
    Update,
    Upsert,
}

impl AnalyticsAction {
    pub fn from_str(s: &str) -> Option<AnalyticsAction> {
        match s {
            "Create" => Some(AnalyticsAction::Create),
            "Delete" => Some(AnalyticsAction::Delete),
            "DeleteMany" => Some(AnalyticsAction::DeleteMany),
            "Duplicate" => Some(AnalyticsAction::Duplicate),
            "Export" => Some(AnalyticsAction::Export),
            "Hide" => Some(AnalyticsAction::Hide),
            "Import" => Some(AnalyticsAction::Import),
            "Launch" => Some(AnalyticsAction::Launch),
            "LaunchFirst" => Some(AnalyticsAction::LaunchFirst),
            "LaunchUpdate" => Some(AnalyticsAction::LaunchUpdate),
            "Send" => Some(AnalyticsAction::Send),
            "Show" => Some(AnalyticsAction::Show),
            "Toggle" => Some(AnalyticsAction::Toggle),
            "Update" => Some(AnalyticsAction::Update),
            "Upsert" => Some(AnalyticsAction::Upsert),
            _ => None,
        }
    }
}

fn resource_name(resource: AnalyticsResource) -> &'static str {
    match resource {
        AnalyticsResource::App => "app",
        AnalyticsResource::CookieJar => "cookie_jar",
        AnalyticsResource::Dialog => "dialog",
        AnalyticsResource::Environment => "environment",
        AnalyticsResource::Folder => "folder",
        AnalyticsResource::GrpcRequest => "grpc_request",
        AnalyticsResource::HttpRequest => "http_request",
        AnalyticsResource::HttpResponse => "http_response",
        AnalyticsResource::KeyValue => "key_value",
        AnalyticsResource::Sidebar => "sidebar",
        AnalyticsResource::Workspace => "workspace",
    }
}

fn action_name(action: AnalyticsAction) -> &'static str {
    match action {
        AnalyticsAction::Create => "create",
        AnalyticsAction::Delete => "delete",
        AnalyticsAction::DeleteMany => "delete_many",
        AnalyticsAction::Duplicate => "duplicate",
        AnalyticsAction::Export => "export",
        AnalyticsAction::Hide => "hide",
        AnalyticsAction::Import => "import",
        AnalyticsAction::Launch => "launch",
        AnalyticsAction::LaunchFirst => "launch_first",
        AnalyticsAction::LaunchUpdate => "launch_update",
        AnalyticsAction::Send => "send",
        AnalyticsAction::Show => "show",
        AnalyticsAction::Toggle => "toggle",
        AnalyticsAction::Update => "update",
        AnalyticsAction::Upsert => "upsert",
    }
}

#[derive(Default, Debug)]
pub struct LaunchEventInfo {
    pub current_version: String,
    pub previous_version: String,
    pub launched_after_update: bool,
    pub num_launches: i32,
}

pub async fn track_launch_event(app_handle: &AppHandle) -> LaunchEventInfo {
    let namespace = "analytics";
    let last_tracked_version_key = "last_tracked_version";

    let mut info = LaunchEventInfo::default();

    info.num_launches =
        models::get_key_value_int(app_handle, namespace, "num_launches", 0).await + 1;
    info.previous_version =
        models::get_key_value_string(app_handle, namespace, last_tracked_version_key, "").await;
    info.current_version = app_handle.package_info().version.to_string();

    if info.previous_version.is_empty() {
        track_event(
            app_handle,
            AnalyticsResource::App,
            AnalyticsAction::LaunchFirst,
            None,
        )
        .await;
    } else {
        info.launched_after_update = info.current_version != info.previous_version;
        if info.launched_after_update {
            track_event(
                app_handle,
                AnalyticsResource::App,
                AnalyticsAction::LaunchUpdate,
                Some(json!({ "num_launches": info.num_launches })),
            )
            .await;
        }
    };

    // Track a launch event in all cases
    track_event(
        app_handle,
        AnalyticsResource::App,
        AnalyticsAction::Launch,
        Some(json!({ "num_launches": info.num_launches })),
    )
    .await;

    // Update key values

    models::set_key_value_string(
        app_handle,
        namespace,
        last_tracked_version_key,
        info.current_version.as_str(),
    )
    .await;
    models::set_key_value_int(app_handle, namespace, "num_launches", info.num_launches).await;

    info
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
        false => "https://t.yaak.app",
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

    // Disable analytics actual sending in dev
    if is_dev() {
        debug!("track: {} {}", event, attributes_json);
        return;
    }

    if let Err(e) = req.send().await {
        warn!(
            "Error sending analytics event: {} {} {} {:?}",
            e, event, attributes_json, params,
        );
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
