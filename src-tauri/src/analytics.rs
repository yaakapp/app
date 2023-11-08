use sqlx::types::JsonValue;

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

pub async fn track_event(
    resource: AnalyticsResource,
    action: AnalyticsAction,
    attributes: Option<JsonValue>,
) {
    let event = format!("{}.{}", resource_name(resource), action_name(action));
    let attributes_json = attributes.unwrap_or("{}".to_string().into()).to_string();
    let params = vec![
        ("e", event.clone()),
        ("a", attributes_json.clone()),
        ("id", "site_zOK0d7jeBy2TLxFCnZ".to_string()),
    ];
    let url = format!("https://t.yaak.app/t/e");
    let req = reqwest::Client::builder()
        .build()
        .unwrap()
        .get(&url)
        .query(&params);

    if is_dev() {
        println!("Ignore dev analytics event: {}", event);
    } else {
        if let Err(e) = req.send().await {
            println!("Error sending analytics event: {}", e);
        } else {
            println!("Sent analytics event: {}", event);
        }
    }
}
