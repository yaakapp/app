#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use std::env::current_dir;
use std::fs::create_dir_all;

use base64::Engine;
use http::header::{HeaderName, ACCEPT, USER_AGENT};
use http::{HeaderMap, HeaderValue, Method};
use reqwest::redirect::Policy;
use serde::Serialize;
use sqlx::migrate::Migrator;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::types::Json;
use sqlx::{Pool, Sqlite};
use tauri::regex::Regex;
use tauri::{AppHandle, Menu, MenuItem, RunEvent, State, Submenu, TitleBarStyle, Window, Wry};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};
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
    println!("Migrations complete");
    Ok(())
}

#[tauri::command]
async fn send_ephemeral_request(
    request: models::HttpRequest,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let response = models::HttpResponse::default();
    return actually_send_ephemeral_request(request, &response, &app_handle, pool).await;
}

async fn actually_send_ephemeral_request(
    request: models::HttpRequest,
    response: &models::HttpResponse,
    app_handle: &AppHandle<Wry>,
    pool: &Pool<Sqlite>,
) -> Result<models::HttpResponse, String> {
    let start = std::time::Instant::now();
    let mut url_string = request.url.to_string();

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

    println!("Sending request to {}", url_string);

    let client = reqwest::Client::builder()
        .redirect(Policy::none())
        .build()
        .expect("Failed to build client");

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("yaak"));
    headers.insert(ACCEPT, HeaderValue::from_static("*/*"));

    for h in request.headers.0 {
        if h.name.is_empty() && h.value.is_empty() {
            continue;
        }
        if !h.enabled {
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

    if let Some(b) = &request.authentication_type {
        let empty_value = &serde_json::to_value("").unwrap();
        if b == "basic" {
            let a = request.authentication.0;
            let auth = format!(
                "{}:{}",
                a.get("username")
                    .unwrap_or(empty_value)
                    .as_str()
                    .unwrap_or(""),
                a.get("password")
                    .unwrap_or(empty_value)
                    .as_str()
                    .unwrap_or(""),
            );
            let encoded = base64::engine::general_purpose::STANDARD_NO_PAD.encode(auth);
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Basic {}", encoded)).unwrap(),
            );
        } else if b == "bearer" {
            let token = request
                .authentication
                .0
                .get("token")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or("");
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Bearer {}", token)).unwrap(),
            );
        }
    }

    let m = Method::from_bytes(request.method.to_uppercase().as_bytes())
        .expect("Failed to create method");
    let builder = client.request(m, url_string.to_string()).headers(headers);

    let sendable_req_result = match (request.body, request.body_type) {
        (Some(b), Some(_)) => builder.body(b).build(),
        _ => builder.build(),
    };

    let sendable_req = match sendable_req_result {
        Ok(r) => r,
        Err(e) => {
            return response_err(response, e.to_string(), &app_handle, pool).await;
        }
    };

    let raw_response = client.execute(sendable_req).await;

    let p = app_handle
        .path_resolver()
        .resolve_resource("plugins/plugin.ts")
        .expect("failed to resolve resource");

    runtime::run_plugin_sync(p.to_str().unwrap()).unwrap();

    match raw_response {
        Ok(v) => {
            let mut response = response.clone();
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
            response = models::update_response_if_id(response, pool)
                .await
                .expect("Failed to update response");
            emit_side_effect(app_handle, "updated_model", &response);
            Ok(response)
        }
        Err(e) => response_err(response, e.to_string(), app_handle, pool).await,
    }
}

#[tauri::command]
async fn send_request(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;

    let req = models::get_request(request_id, pool)
        .await
        .expect("Failed to get request");

    let response = models::create_response(&req.id, 0, "", 0, None, "", vec![], pool)
        .await
        .expect("Failed to create response");

    let response2 = response.clone();
    let app_handle2 = window.app_handle().clone();
    let pool2 = pool.clone();
    tokio::spawn(async move {
        actually_send_ephemeral_request(req, &response2, &app_handle2, &pool2)
            .await
            .expect("Failed to send request");
    });

    emit_and_return(&window, "created_model", response)
}

async fn response_err(
    response: &models::HttpResponse,
    error: String,
    app_handle: &AppHandle<Wry>,
    pool: &Pool<Sqlite>,
) -> Result<models::HttpResponse, String> {
    let mut response = response.clone();
    response.error = Some(error.clone());
    response = models::update_response_if_id(response, pool)
        .await
        .expect("Failed to update response");
    emit_side_effect(app_handle, "updated_model", &response);
    Ok(response)
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
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::KeyValue, String> {
    let pool = &*db_instance.lock().await;
    let (key_value, created) = models::set_key_value(namespace, key, value, pool).await;

    if created {
        emit_and_return(&window, "created_model", key_value)
    } else {
        emit_and_return(&window, "updated_model", key_value)
    }
}

#[tauri::command]
async fn create_workspace(
    name: &str,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Workspace, String> {
    let pool = &*db_instance.lock().await;
    let created_workspace = models::create_workspace(name, "", pool)
        .await
        .expect("Failed to create workspace");

    emit_and_return(&window, "created_model", created_workspace)
}

#[tauri::command]
async fn create_request(
    workspace_id: &str,
    name: &str,
    sort_priority: f64,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    let headers = Vec::new();
    let created_request = models::upsert_request(
        None,
        workspace_id,
        name,
        "GET",
        None,
        None,
        HashMap::new(),
        None,
        "",
        headers,
        sort_priority,
        pool,
    )
    .await
    .expect("Failed to create request");

    emit_and_return(&window, "created_model", created_request)
}

#[tauri::command]
async fn duplicate_request(
    id: &str,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    let request = models::duplicate_request(id, pool)
        .await
        .expect("Failed to duplicate request");
    emit_and_return(&window, "updated_model", request)
}

#[tauri::command]
async fn update_request(
    request: models::HttpRequest,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
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

    // TODO: Figure out how to make this better
    let updated_request = models::upsert_request(
        Some(request.id.as_str()),
        request.workspace_id.as_str(),
        request.name.as_str(),
        request.method.as_str(),
        body,
        request.body_type,
        request.authentication.0,
        request.authentication_type,
        request.url.as_str(),
        request.headers.0,
        request.sort_priority,
        pool,
    )
    .await
    .expect("Failed to update request");

    emit_and_return(&window, "updated_model", updated_request)
}

#[tauri::command]
async fn delete_request(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    let req = models::delete_request(request_id, pool)
        .await
        .expect("Failed to delete request");
    emit_and_return(&window, "deleted_model", req)
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
async fn get_request(
    id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    models::get_request(id, pool)
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
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let response = models::delete_response(id, pool)
        .await
        .expect("Failed to delete response");
    emit_and_return(&window, "deleted_model", response)
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
        let workspace =
            models::create_workspace("My Project", "This is the default workspace", pool)
                .await
                .expect("Failed to create workspace");
        Ok(vec![workspace])
    } else {
        Ok(workspaces)
    }
}

#[tauri::command]
async fn delete_workspace(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    id: &str,
) -> Result<models::Workspace, String> {
    let pool = &*db_instance.lock().await;
    let workspace = models::delete_workspace(id, pool)
        .await
        .expect("Failed to delete workspace");
    emit_and_return(&window, "deleted_model", workspace)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .setup(|app| {
            let dir = match is_dev() {
                true => current_dir().unwrap(),
                false => app.path_resolver().app_data_dir().unwrap(),
            };

            create_dir_all(dir.clone()).expect("Problem creating App directory!");
            let p = dir.join("db.sqlite");
            let p_string = p.to_string_lossy().replace(' ', "%20");
            let url = format!("sqlite://{}?mode=rwc", p_string);
            println!("Connecting to database at {}", url);
            tauri::async_runtime::block_on(async move {
                let pool = SqlitePoolOptions::new()
                    .connect(url.as_str())
                    .await
                    .expect("Failed to connect to database");

                // Setup the DB handle
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
        .invoke_handler(tauri::generate_handler![
            greet,
            workspaces,
            get_request,
            requests,
            send_request,
            send_ephemeral_request,
            duplicate_request,
            create_request,
            create_workspace,
            delete_workspace,
            update_request,
            delete_request,
            responses,
            get_key_value,
            set_key_value,
            delete_response,
            delete_all_responses,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| match event {
            RunEvent::Ready => {
                create_window(app_handle);
            }

            // ExitRequested { api, .. } => {
            // }
            _ => {}
        });
}

fn is_dev() -> bool {
    let env = option_env!("YAAK_ENV");
    env.unwrap_or("production") != "production"
}

fn create_window(handle: &AppHandle<Wry>) -> Window<Wry> {
    let default_menu = Menu::os_default("Yaak".to_string().as_str());
    let mut test_menu = Menu::new()
        .add_item(
            CustomMenuItem::new("send_request".to_string(), "Send Request")
                .accelerator("CmdOrCtrl+r"),
        )
        .add_item(
            CustomMenuItem::new("zoom_reset".to_string(), "Zoom to Actual Size")
                .accelerator("CmdOrCtrl+0"),
        )
        .add_item(
            CustomMenuItem::new("zoom_in".to_string(), "Zoom In").accelerator("CmdOrCtrl+Plus"),
        )
        .add_item(
            CustomMenuItem::new("zoom_out".to_string(), "Zoom Out").accelerator("CmdOrCtrl+-"),
        )
        .add_item(
            CustomMenuItem::new("toggle_sidebar".to_string(), "Toggle Sidebar")
                .accelerator("CmdOrCtrl+b"),
        )
        .add_item(CustomMenuItem::new("new_window".to_string(), "New Window"));
    if is_dev() {
        test_menu = test_menu
            .add_native_item(MenuItem::Separator)
            .add_item(
                CustomMenuItem::new("refresh".to_string(), "Refresh")
                    .accelerator("CmdOrCtrl + Shift + r"),
            )
            .add_item(
                CustomMenuItem::new("toggle_devtools".to_string(), "Open Devtools")
                    .accelerator("CmdOrCtrl + Option + i"),
            );
    }

    let submenu = Submenu::new("Test Menu", test_menu);

    let window_num = handle.windows().len();
    let window_id = format!("wnd_{}", window_num);
    let menu = default_menu.add_submenu(submenu);
    let win = tauri::WindowBuilder::new(handle, window_id, tauri::WindowUrl::App("".into()))
        .menu(menu)
        .fullscreen(false)
        .resizable(true)
        .inner_size(1100.0, 600.0)
        .hidden_title(true)
        .title("Yaak")
        .title_bar_style(TitleBarStyle::Overlay)
        .build()
        .expect("failed to build window");

    let win2 = win.clone();
    let handle2 = handle.clone();
    win.on_menu_event(move |event| match event.menu_item_id() {
        "quit" => std::process::exit(0),
        "close" => win2.close().unwrap(),
        "zoom_reset" => win2.emit("zoom", 0).unwrap(),
        "zoom_in" => win2.emit("zoom", 1).unwrap(),
        "zoom_out" => win2.emit("zoom", -1).unwrap(),
        "toggle_sidebar" => win2.emit("toggle_sidebar", true).unwrap(),
        "refresh" => win2.emit("refresh", true).unwrap(),
        "send_request" => win2.emit("send_request", true).unwrap(),
        "new_window" => _ = create_window(&handle2),
        "toggle_devtools" => {
            if win2.is_devtools_open() {
                win2.close_devtools();
            } else {
                win2.open_devtools();
            }
        }
        _ => {}
    });

    let win3 = win.clone();
    win.on_window_event(move |e| {
        let apply_offset = || {
            #[cfg(target_os = "macos")]
            win3.position_traffic_lights();
        };

        match e {
            WindowEvent::Resized(..) => apply_offset(),
            WindowEvent::ThemeChanged(..) => apply_offset(),
            WindowEvent::CloseRequested { .. } => {
                println!("CLOSE REQUESTED");
                // api.prevent_close();
            }
            _ => {}
        }
    });

    #[cfg(target_os = "macos")]
    win.position_traffic_lights();

    win
}

/// Emit an event to all windows, with a source window
fn emit_and_return<S: Serialize + Clone, E>(
    current_window: &Window<Wry>,
    event: &str,
    payload: S,
) -> Result<S, E> {
    current_window.emit_all(event, &payload).unwrap();
    Ok(payload)
}

/// Emit an event to all windows, used for side-effects where there is no source window to attribute. This
fn emit_side_effect<S: Serialize + Clone>(app_handle: &AppHandle<Wry>, event: &str, payload: S) {
    app_handle.emit_all(event, &payload).unwrap();
}
