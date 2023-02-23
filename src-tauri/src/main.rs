#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use tokio::sync::Mutex;

use http::header::{HeaderName, USER_AGENT};
use http::{HeaderMap, HeaderValue, Method};
use reqwest::redirect::Policy;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, State, Wry};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent};

use window_ext::WindowExt;

mod runtime;
mod window_ext;

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
            tauri::async_runtime::block_on(async move {
                let pool = SqlitePoolOptions::new()
                    .connect("sqlite://db.sqlite?mode=rwc")
                    .await
                    .unwrap();
                app.manage(Mutex::new(pool));

                Ok(())
            })
        })
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                _ => {}
            },
            _ => {}
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
        .invoke_handler(tauri::generate_handler![send_request, greet, load_db,])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

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
    let row = sqlx::query(
        "CREATE TABLE IF NOT EXISTS responses (
              id INTEGER PRIMARY KEY,
              body TEXT NOT NULL,
              status INT NOT NULL",
    )
    .execute(&*db_instance.lock().await)
    .await;
    match row {
        Ok(_) => println!("SUCCESS!"),
        Err(e) => println!("Error: {}", e),
    }

    Ok(())
}

#[tauri::command]
async fn send_request(
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    url: &str,
    method: &str,
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
    let req = client
        .request(m, abs_url.to_string())
        .headers(headers)
        .build();

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
            sqlx::query("INSERT INTO responses (body, status) VALUES (?, ?)")
                .bind(body.clone())
                .bind(status.clone())
                .execute(&*db_instance.lock().await)
                .await
                .unwrap();
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
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
