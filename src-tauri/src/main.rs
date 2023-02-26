#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use std::fs::create_dir_all;
use std::path::Path;

use http::header::{HeaderName, USER_AGENT};
use http::{HeaderMap, HeaderValue, Method};
use reqwest::redirect::Policy;
use sqlx::migrate::Migrator;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, State, Wry};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
use tokio::sync::Mutex;

use window_ext::WindowExt;

use crate::models::HttpRequestHeader;

mod models;
mod runtime;
mod window_ext;

#[derive(serde::Serialize)]
pub struct CustomResponse {
    status: u16,
    body: String,
    url: String,
    method: String,
    elapsed: u128,
    elapsed2: u128,
    headers: HashMap<String, String>,
    pub status_reason: Option<&'static str>,
}

#[tauri::command]
async fn load_db(db_instance: State<'_, Mutex<Pool<Sqlite>>>) -> Result<(), String> {
    let pool = &*db_instance.lock().await;
    let m = Migrator::new(Path::new("./migrations"))
        .await
        .expect("Failed to load migrations");
    m.run(pool).await.expect("Failed to run migrations");
    Ok(())
}

#[tauri::command]
async fn send_request(
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let req = models::get_request(request_id, pool)
        .await
        .expect("Failed to get request");
    let start = std::time::Instant::now();

    let mut abs_url = req.url.to_string();
    if !abs_url.starts_with("http://") && !abs_url.starts_with("https://") {
        abs_url = format!("http://{}", req.url);
    }

    let client = reqwest::Client::builder()
        .redirect(Policy::none())
        .build()
        .unwrap();

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("reqwest"));
    headers.insert("x-foo-bar", HeaderValue::from_static("hi mom"));
    headers.insert(
        HeaderName::from_static("x-api-key"),
        HeaderValue::from_static("123-123-123"),
    );

    let m = Method::from_bytes(req.method.to_uppercase().as_bytes()).unwrap();
    let builder = client.request(m, abs_url.to_string()).headers(headers);

    let sendable_req = match req.body {
        Some(b) => builder.body(b).build(),
        None => builder.build(),
    }
    .expect("Failed to build request");

    let resp = client.execute(sendable_req).await;

    let p = app_handle
        .path_resolver()
        .resolve_resource("plugins/plugin.ts")
        .expect("failed to resolve resource");

    runtime::run_plugin_sync(p.to_str().unwrap()).unwrap();

    match resp {
        Ok(v) => {
            let status = v.status().as_u16() as i64;
            let status_reason = v.status().canonical_reason();
            let headers = v
                .headers()
                .iter()
                .map(|(k, v)| models::HttpResponseHeader {
                    name: k.as_str().to_string(),
                    value: v.to_str().unwrap().to_string(),
                })
                .collect();
            let url = v.url().clone();
            let body = v.text().await.expect("Failed to get body");
            let elapsed = start.elapsed().as_millis() as i64;
            let response = models::create_response(
                &req.id,
                elapsed,
                url.as_str(),
                status,
                status_reason,
                body.as_str(),
                headers,
                pool,
            )
            .await
            .expect("Failed to create response");

            Ok(response)
        }
        Err(e) => {
            println!("Error: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn upsert_request(
    id: Option<&str>,
    workspace_id: &str,
    name: &str,
    url: &str,
    body: Option<&str>,
    headers: Vec<HttpRequestHeader>,
    method: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    models::upsert_request(id, workspace_id, name, method, body, url, headers, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn requests(
    workspace_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::HttpRequest>, String> {
    let pool = &*db_instance.lock().await;
    models::find_requests(workspace_id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn responses(
    request_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::HttpResponse>, String> {
    let pool = &*db_instance.lock().await;
    models::find_responses(request_id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_response(
    id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<(), String> {
    let pool = &*db_instance.lock().await;
    models::delete_response(id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_all_responses(
    request_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<(), String> {
    let pool = &*db_instance.lock().await;
    models::delete_all_responses(request_id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn workspaces(
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::Workspace>, String> {
    let pool = &*db_instance.lock().await;
    let workspaces = models::find_workspaces(pool)
        .await
        .expect("Failed to find workspaces");
    if workspaces.is_empty() {
        let workspace = models::create_workspace("Default", "This is the default workspace", pool)
            .await
            .expect("Failed to create workspace");
        Ok(vec![workspace])
    } else {
        Ok(workspaces)
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .setup(|app| {
            let win = app.get_window("main").unwrap();
            win.position_traffic_lights();
            Ok(())
        })
        .setup(|app| {
            let dir = app.path_resolver().app_data_dir().unwrap();
            create_dir_all(dir.clone()).expect("Problem creating App directory!");
            let p = dir.join("db.sqlite");
            let p_string = p.to_string_lossy().replace(' ', "%20");
            let url = format!("sqlite://{}?mode=rwc", p_string);
            println!("DB PATH: {}", p_string);
            tauri::async_runtime::block_on(async move {
                let pool = SqlitePoolOptions::new()
                    .connect(url.as_str())
                    .await
                    .expect("Failed to connect to database");
                app.manage(Mutex::new(pool));
                Ok(())
            })
        })
        .on_system_tray_event(|app, event| {
            if let SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    _ => {}
                }
            }
        })
        .on_window_event(|e| {
            let apply_offset = || {
                let win = e.window();
                win.position_traffic_lights();
            };

            match e.event() {
                WindowEvent::Resized(..) => apply_offset(),
                WindowEvent::ThemeChanged(..) => apply_offset(),
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            load_db,
            workspaces,
            requests,
            send_request,
            upsert_request,
            responses,
            delete_response,
            delete_all_responses,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
