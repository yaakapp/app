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

use crate::models::{create_workspace, find_workspaces, Request, Workspace};
use window_ext::WindowExt;

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
    url: &str,
    method: &str,
    body: Option<&str>,
) -> Result<CustomResponse, String> {
    let start = std::time::Instant::now();

    let mut abs_url = url.to_string();
    if !abs_url.starts_with("http://") && !abs_url.starts_with("https://") {
        abs_url = format!("http://{}", url);
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

    let m = Method::from_bytes(method.to_uppercase().as_bytes()).unwrap();
    let builder = client.request(m, abs_url.to_string()).headers(headers);

    let req = match body {
        Some(b) => builder.body(b.to_string()).build(),
        None => builder.build(),
    };

    let req = match req {
        Ok(v) => v,
        Err(e) => {
            println!("Error: {}", e);
            return Err(e.to_string());
        }
    };

    let resp = client.execute(req).await;
    let elapsed = start.elapsed().as_millis();

    let p = app_handle
        .path_resolver()
        .resolve_resource("plugins/plugin.ts")
        .expect("failed to resolve resource");

    runtime::run_plugin_sync(p.to_str().unwrap()).unwrap();

    match resp {
        Ok(v) => {
            let url = v.url().to_string();
            let status = v.status().as_u16();
            let status_reason = v.status().canonical_reason();
            let method = method.to_string();
            let headers = v
                .headers()
                .iter()
                .map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap().to_string()))
                .collect::<HashMap<String, String>>();
            let body = v.text().await.unwrap();
            let elapsed2 = start.elapsed().as_millis();
            Ok(CustomResponse {
                status,
                status_reason,
                body,
                elapsed,
                elapsed2,
                method,
                url,
                headers,
            })
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
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Request, String> {
    let pool = &*db_instance.lock().await;
    models::upsert_request(
        id,
        workspace_id,
        name,
        "GET",
        None,
        "https://google.com",
        pool,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn requests(
    workspace_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<Request>, String> {
    let pool = &*db_instance.lock().await;
    models::find_requests(workspace_id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn workspaces(db_instance: State<'_, Mutex<Pool<Sqlite>>>) -> Result<Vec<Workspace>, String> {
    let pool = &*db_instance.lock().await;
    let workspaces = find_workspaces(pool)
        .await
        .expect("Failed to find workspaces");
    if workspaces.is_empty() {
        let workspace = create_workspace("Default", "This is the default workspace", pool)
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
            let p_string = p.to_string_lossy().replace(" ", "%20");
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
            send_request,
            greet,
            load_db,
            workspaces,
            requests,
            upsert_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
