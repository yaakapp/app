#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use std::env;
use std::env::current_dir;
use std::fs::create_dir_all;

use http::{HeaderMap, HeaderValue, Method};
use http::header::{ACCEPT, HeaderName, USER_AGENT};
use reqwest::redirect::Policy;
use sqlx::{Pool, Sqlite};
use sqlx::migrate::Migrator;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::types::Json;
use tauri::{AppHandle, Menu, State, Submenu, Wry};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
use tauri::regex::Regex;
use tokio::sync::Mutex;

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

async fn migrate_db(
    app_handle: AppHandle<Wry>,
    db_instance: &Mutex<Pool<Sqlite>>,
) -> Result<(), String> {
    let pool = &*db_instance.lock().await;
    let p = app_handle
        .path_resolver()
        .resolve_resource("migrations")
        .expect("failed to resolve resource");
    println!("Running migrations at {}", p.to_string_lossy());
    let m = Migrator::new(p).await.expect("Failed to load migrations");
    m.run(pool).await.expect("Failed to run migrations");
    Ok(())
}

#[tauri::command]
async fn send_request(
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
) -> Result<String, String> {
    let pool = &*db_instance.lock().await;

    let req = models::get_request(request_id, pool)
        .await
        .expect("Failed to get request");

    let mut response = models::create_response(&req.id, 0, "", 0, None, "", vec![], pool)
        .await
        .expect("Failed to create response");
    app_handle.emit_all("updated_response", &response).unwrap();

    let start = std::time::Instant::now();

    let mut url_string = req.url.to_string();

    let mut variables = HashMap::new();
    variables.insert("PROJECT_ID", "project_123");
    variables.insert("TOKEN", "s3cret");
    variables.insert("DOMAIN", "schier.co");
    variables.insert("BASE_URL", "https://schier.co");

    let re = Regex::new(r"\$\{\[\s*([^]\s]+)\s*]}").expect("Failed to create regex");
    url_string = re
        .replace(&url_string, |caps: &tauri::regex::Captures| {
            let key = caps.get(1).unwrap().as_str();
            match variables.get(key) {
                Some(v) => v,
                None => "",
            }
        })
        .to_string();

    if !url_string.starts_with("http://") && !url_string.starts_with("https://") {
        url_string = format!("http://{}", url_string);
    }

    let client = reqwest::Client::builder()
        .redirect(Policy::none())
        .build()
        .expect("Failed to build client");

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("yaak"));
    headers.insert(ACCEPT, HeaderValue::from_static("*/*"));

    for h in req.headers.0 {
        if h.name.is_empty() && h.value.is_empty() {
            continue;
        }
        let header_name = match HeaderName::from_bytes(h.name.as_bytes()) {
            Ok(n) => n,
            Err(e) => {
                eprintln!("Failed to create header name: {}", e);
                continue;
            }
        };
        let header_value = match HeaderValue::from_str(h.value.as_str()) {
            Ok(n) => n,
            Err(e) => {
                eprintln!("Failed to create header value: {}", e);
                continue;
            }
        };
        headers.insert(header_name, header_value);
    }

    let m =
        Method::from_bytes(req.method.to_uppercase().as_bytes()).expect("Failed to create method");
    let builder = client.request(m, url_string.to_string()).headers(headers);

    let sendable_req_result = match req.body {
        Some(b) => builder.body(b).build(),
        None => builder.build(),
    };

    let sendable_req = match sendable_req_result {
        Ok(r) => r,
        Err(e) => {
            return response_err(response, e.to_string(), app_handle, pool).await;
        }
    };

    let resp = client.execute(sendable_req).await;

    let p = app_handle
        .path_resolver()
        .resolve_resource("plugins/plugin.ts")
        .expect("failed to resolve resource");

    runtime::run_plugin_sync(p.to_str().unwrap()).unwrap();

    match resp {
        Ok(v) => {
            response.status = v.status().as_u16() as i64;
            response.status_reason = v.status().canonical_reason().map(|s| s.to_string());
            response.headers = Json(
                v.headers()
                    .iter()
                    .map(|(k, v)| models::HttpResponseHeader {
                        name: k.as_str().to_string(),
                        value: v.to_str().unwrap().to_string(),
                    })
                    .collect(),
            );
            response.url = v.url().to_string();
            response.body = v.text().await.expect("Failed to get body");
            response.elapsed = start.elapsed().as_millis() as i64;
            response = models::update_response(response, pool)
                .await
                .expect("Failed to update response");
            app_handle.emit_all("updated_response", &response).unwrap();
            Ok(response.id)
        }
        Err(e) => response_err(response, e.to_string(), app_handle, pool).await,
    }
}

async fn response_err(
    mut response: models::HttpResponse,
    error: String,
    app_handle: AppHandle<Wry>,
    pool: &Pool<Sqlite>,
) -> Result<String, String> {
    response.error = Some(error.clone());
    response = models::update_response(response, pool)
        .await
        .expect("Failed to update response");
    app_handle.emit_all("updated_response", &response).unwrap();
    Ok(response.id)
}

#[tauri::command]
async fn get_key_value(
    namespace: &str,
    key: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Option<models::KeyValue>, ()> {
    let pool = &*db_instance.lock().await;
    let result = models::get_key_value(namespace, key, pool).await;
    Ok(result)
}

#[tauri::command]
async fn set_key_value(
    namespace: &str,
    key: &str,
    value: &str,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<(), String> {
    let pool = &*db_instance.lock().await;
    let created_key_value =
        models::set_key_value(namespace, key, value, pool)
            .await
            .expect("Failed to create key value");

    app_handle
        .emit_all("updated_key_value", &created_key_value)
        .unwrap();

    Ok(())
}

#[tauri::command]
async fn create_request(
    workspace_id: &str,
    name: &str,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<String, String> {
    let pool = &*db_instance.lock().await;
    let headers = Vec::new();
    let created_request =
        models::upsert_request(None, workspace_id, name, "GET", None, None, "", headers, pool)
            .await
            .expect("Failed to create request");

    app_handle
        .emit_all("updated_request", &created_request)
        .unwrap();

    Ok(created_request.id)
}

#[tauri::command]
async fn update_request(
    request: models::HttpRequest,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<(), String> {
    let pool = &*db_instance.lock().await;

    // TODO: Figure out how to make this better
    let b2;
    let body = match request.body {
        Some(b) => {
            b2 = b;
            Some(b2.as_str())
        }
        None => None,
    };

    let updated_request = models::upsert_request(
        Some(request.id.as_str()),
        request.workspace_id.as_str(),
        request.name.as_str(),
        request.method.as_str(),
        body,
        request.body_type,
        request.url.as_str(),
        request.headers.0,
        pool,
    )
        .await
        .expect("Failed to update request");

    app_handle
        .emit_all("updated_request", updated_request)
        .unwrap();

    Ok(())
}

#[tauri::command]
async fn delete_request(
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    let req = models::delete_request(request_id, pool)
        .await
        .expect("Failed to delete request");
    app_handle.emit_all("deleted_request", request_id).unwrap();

    Ok(req)
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
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    let default_menu = Menu::os_default("Yaak".to_string().as_str());
    let submenu = Submenu::new("Test Menu", Menu::new()
        .add_item(CustomMenuItem::new("refresh".to_string(), "Refresh").accelerator("CmdOrCtrl+Shift+r"))
        .add_item(CustomMenuItem::new("send_request".to_string(), "Send Request").accelerator("CmdOrCtrl+r"))
        .add_item(CustomMenuItem::new("zoom_reset".to_string(), "Zoom to Actual Size").accelerator("CmdOrCtrl+0"))
        .add_item(CustomMenuItem::new("zoom_in".to_string(), "Zoom In").accelerator("CmdOrCtrl+Plus"))
        .add_item(CustomMenuItem::new("zoom_out".to_string(), "Zoom Out").accelerator("CmdOrCtrl+-")),
    );

    let menu = default_menu.add_submenu(submenu);

    tauri::Builder::default()
        .menu(menu)
        .system_tray(system_tray)
        .setup(|app| {
            let win = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            win.position_traffic_lights();

            Ok(())
        })
        .setup(|app| {
            let dir = match is_dev() {
                true => current_dir().unwrap(),
                false => app.path_resolver().app_data_dir().unwrap(),
            };

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
                let m = Mutex::new(pool);
                migrate_db(app.handle(), &m)
                    .await
                    .expect("Failed to migrate database");
                app.manage(m);
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
                };
            }
        })
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => std::process::exit(0),
                "close" => event.window().close().unwrap(),
                "zoom_reset" => event.window().emit("zoom", 0).unwrap(),
                "zoom_in" => event.window().emit("zoom", 1).unwrap(),
                "zoom_out" => event.window().emit("zoom", -1).unwrap(),
                "refresh" => event.window().emit("refresh", true).unwrap(),
                "send_request" => event.window().emit("send_request", true).unwrap(),
                _ => {}
            };
        })
        .on_window_event(|e| {
            let apply_offset = || {
                let win = e.window();

                #[cfg(target_os = "macos")]
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
            workspaces,
            requests,
            send_request,
            create_request,
            update_request,
            delete_request,
            responses,
            get_key_value,
            set_key_value,
            delete_response,
            delete_all_responses,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn is_dev() -> bool {
    let env = option_env!("YAAK_ENV");
    env.unwrap_or("production") != "production"
}
