use sqlx::types::JsonValue;
use tauri::{async_runtime, AppHandle, Manager};

use crate::is_dev;

pub enum AnalyticsResource {
    App,
    // Workspace,
    // Environment,
    // Folder,
    // HttpRequest,
    // HttpResponse,
}

pub enum AnalyticsAction {
    Launch,
    // Create,
    // Update,
    // Upsert,
    // Delete,
    // Send,
    // Duplicate,
}

fn resource_name(resource: AnalyticsResource) -> &'static str {
    match resource {
        AnalyticsResource::App => "app",
        // AnalyticsResource::Workspace => "workspace",
        // AnalyticsResource::Environment => "environment",
        // AnalyticsResource::Folder => "folder",
        // AnalyticsResource::HttpRequest => "http_request",
        // AnalyticsResource::HttpResponse => "http_response",
    }
}

fn action_name(action: AnalyticsAction) -> &'static str {
    match action {
        AnalyticsAction::Launch => "launch",
        // AnalyticsAction::Create => "create",
        // AnalyticsAction::Update => "update",
        // AnalyticsAction::Upsert => "upsert",
        // AnalyticsAction::Delete => "delete",
        // AnalyticsAction::Send => "send",
        // AnalyticsAction::Duplicate => "duplicate",
    }
}

pub fn track_event(
    app_handle: &AppHandle,
    resource: AnalyticsResource,
    action: AnalyticsAction,
    attributes: Option<JsonValue>,
) {
    async_runtime::block_on(async move {
        let event = format!("{}.{}", resource_name(resource), action_name(action));
        let attributes_json = attributes.unwrap_or("{}".to_string().into()).to_string();
        let info = app_handle.package_info();
        let tz = datetime::sys_timezone().unwrap_or("unknown".to_string());
        let params = vec![
            ("e", event.clone()),
            ("a", attributes_json.clone()),
            ("id", "site_zOK0d7jeBy2TLxFCnZ".to_string()),
            ("v", info.version.clone().to_string()),
            ("os", get_os().to_string()),
            ("tz", tz),
            ("xy", get_window_size(app_handle)),
        ];
        let url = "https://t.yaak.app/t/e".to_string();
        let req = reqwest::Client::builder()
            .build()
            .unwrap()
            .get(&url)
            .query(&params);

        if !is_dev() {
            println!("Ignore dev analytics event: {} {:?}", event, params);
        } else if let Err(e) = req.send().await {
            println!(
                "Error sending analytics event: {} {} {:?}",
                e, event, params
            );
        } else {
            println!("Sent analytics event: {}: {:?}", event, params);
        }
    });
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
