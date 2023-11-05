#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use std::env::current_dir;
use std::fs::{create_dir_all, File};
use std::io::Write;
use std::process::exit;

use base64::Engine;
use http::header::{HeaderName, ACCEPT, USER_AGENT};
use http::{HeaderMap, HeaderValue, Method};
use rand::random;
use reqwest::redirect::Policy;
use serde::Serialize;
use sqlx::migrate::Migrator;
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::types::Json;
use sqlx::{Pool, Sqlite};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri::{AppHandle, Menu, RunEvent, State, Submenu, Window, WindowUrl, Wry};
use tauri::{CustomMenuItem, Manager, WindowEvent};
use tauri_plugin_window_state::{StateFlags, WindowExt};
use tokio::sync::Mutex;

use window_ext::TrafficLightWindowExt;

mod models;
mod plugin;
mod render;
mod window_ext;
mod window_menu;

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
    environment_id: Option<&str>,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let response = models::HttpResponse::default();
    let environment_id2 = environment_id.unwrap_or("n/a").to_string();
    return actually_send_ephemeral_request(
        request,
        &response,
        &environment_id2,
        &app_handle,
        pool,
    )
    .await;
}

async fn actually_send_ephemeral_request(
    request: models::HttpRequest,
    response: &models::HttpResponse,
    environment_id: &str,
    app_handle: &AppHandle<Wry>,
    pool: &Pool<Sqlite>,
) -> Result<models::HttpResponse, String> {
    let start = std::time::Instant::now();
    let environment = models::get_environment(environment_id, pool).await.ok();
    let environment_ref = environment.as_ref();
    let workspace = models::get_workspace(&request.workspace_id, pool)
        .await
        .expect("Failed to get workspace");

    let mut url_string = render::render(&request.url, &workspace, environment.as_ref());

    if !url_string.starts_with("http://") && !url_string.starts_with("https://") {
        url_string = format!("http://{}", url_string);
    }

    let client = reqwest::Client::builder()
        .redirect(Policy::none())
        // .danger_accept_invalid_certs(true)
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

        let name = render::render(&h.name, &workspace, environment_ref);
        let value = render::render(&h.value, &workspace, environment_ref);

        let header_name = match HeaderName::from_bytes(name.as_bytes()) {
            Ok(n) => n,
            Err(e) => {
                eprintln!("Failed to create header name: {}", e);
                continue;
            }
        };
        let header_value = match HeaderValue::from_str(value.as_str()) {
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
        let a = request.authentication.0;

        if b == "basic" {
            let raw_username = a
                .get("username")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or("");
            let raw_password = a
                .get("password")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or("");
            let username = render::render(raw_username, &workspace, environment_ref);
            let password = render::render(raw_password, &workspace, environment_ref);

            let auth = format!("{username}:{password}");
            let encoded = base64::engine::general_purpose::STANDARD_NO_PAD.encode(auth);
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Basic {}", encoded)).unwrap(),
            );
        } else if b == "bearer" {
            let raw_token = a.get("token").unwrap_or(empty_value).as_str().unwrap_or("");
            let token = render::render(raw_token, &workspace, environment_ref);
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Bearer {token}")).unwrap(),
            );
        }
    }

    let m = Method::from_bytes(request.method.to_uppercase().as_bytes())
        .expect("Failed to create method");
    let builder = client.request(m, url_string.to_string()).headers(headers);

    let sendable_req_result = match (request.body, request.body_type) {
        (Some(raw_body), Some(_)) => {
            let body = render::render(&raw_body, &workspace, environment_ref);
            builder.body(body).build()
        }
        _ => builder.build(),
    };

    let sendable_req = match sendable_req_result {
        Ok(r) => r,
        Err(e) => {
            return response_err(response, e.to_string(), &app_handle, pool).await;
        }
    };

    let raw_response = client.execute(sendable_req).await;

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
            let body_bytes = v.bytes().await.expect("Failed to get body").to_vec();
            response.content_length = Some(body_bytes.len() as i64);

            {
                // Write body to FS
                let dir = app_handle.path_resolver().app_data_dir().unwrap();
                let base_dir = dir.join("responses");
                create_dir_all(base_dir.clone()).expect("Failed to create responses dir");
                let body_path = match response.id == "" {
                    false => base_dir.join(response.id.clone()),
                    true => base_dir.join(uuid::Uuid::new_v4().to_string()),
                };
                let mut f = File::options()
                    .create(true)
                    .truncate(true)
                    .write(true)
                    .open(&body_path)
                    .expect("Failed to open file");
                f.write_all(body_bytes.as_slice())
                    .expect("Failed to write to file");
                response.body_path = Some(
                    body_path
                        .to_str()
                        .expect("Failed to get body path")
                        .to_string(),
                );
            }

            // Also store body directly on the model, if small enough
            if body_bytes.len() < 100_000 {
                response.body = Some(body_bytes);
            }

            response.elapsed = start.elapsed().as_millis() as i64;
            response = models::update_response_if_id(&response, pool)
                .await
                .expect("Failed to update response");
            if request.id != "" {
                emit_side_effect(app_handle, "updated_model", &response);
            }
            Ok(response)
        }
        Err(e) => response_err(response, e.to_string(), app_handle, pool).await,
    }
}
#[tauri::command]
async fn import_data(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    file_paths: Vec<&str>,
) -> Result<plugin::ImportedResources, String> {
    let pool = &*db_instance.lock().await;
    let imported = plugin::run_plugin_import(
        &window.app_handle(),
        pool,
        "insomnia-importer",
        file_paths.first().unwrap(),
    )
    .await;
    Ok(imported)
}

#[tauri::command]
async fn send_request(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
    environment_id: Option<&str>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;

    let req = models::get_request(request_id, pool)
        .await
        .expect("Failed to get request");

    let response = models::create_response(&req.id, 0, "", 0, None, None, None, None, vec![], pool)
        .await
        .expect("Failed to create response");

    let response2 = response.clone();
    let environment_id2 = environment_id.unwrap_or("n/a").to_string();
    let app_handle2 = window.app_handle().clone();
    let pool2 = pool.clone();

    tokio::spawn(async move {
        actually_send_ephemeral_request(req, &response2, &environment_id2, &app_handle2, &pool2)
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
    response = models::update_response_if_id(&response, pool)
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
    let created_workspace = models::upsert_workspace(
        pool,
        models::Workspace {
            name: name.to_string(),
            ..Default::default()
        },
    )
    .await
    .expect("Failed to create workspace");

    emit_and_return(&window, "created_model", created_workspace)
}

#[tauri::command]
async fn create_environment(
    workspace_id: &str,
    name: &str,
    variables: Vec<models::EnvironmentVariable>,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Environment, String> {
    let pool = &*db_instance.lock().await;
    let created_environment = models::upsert_environment(
        pool,
        models::Environment {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            variables: Json(variables),
            ..Default::default()
        },
    )
    .await
    .expect("Failed to create environment");

    emit_and_return(&window, "created_model", created_environment)
}

#[tauri::command]
async fn create_request(
    workspace_id: &str,
    name: &str,
    sort_priority: f64,
    folder_id: Option<&str>,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    let created_request = models::upsert_request(
        pool,
        models::HttpRequest {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            method: "GET".to_string(),
            folder_id: folder_id.map(|s| s.to_string()),
            sort_priority,
            ..Default::default()
        },
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
async fn update_workspace(
    workspace: models::Workspace,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Workspace, String> {
    let pool = &*db_instance.lock().await;

    let updated_workspace = models::upsert_workspace(pool, workspace)
        .await
        .expect("Failed to update request");

    emit_and_return(&window, "updated_model", updated_workspace)
}

#[tauri::command]
async fn update_environment(
    environment: models::Environment,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Environment, String> {
    let pool = &*db_instance.lock().await;

    let updated_environment = models::upsert_environment(pool, environment)
        .await
        .expect("Failed to update environment");

    emit_and_return(&window, "updated_model", updated_environment)
}

#[tauri::command]
async fn update_request(
    request: models::HttpRequest,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpRequest, String> {
    let pool = &*db_instance.lock().await;
    let updated_request = models::upsert_request(pool, request)
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
async fn list_folders(
    workspace_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::Folder>, String> {
    let pool = &*db_instance.lock().await;
    models::find_folders(workspace_id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_folder(
    workspace_id: &str,
    name: &str,
    sort_priority: f64,
    folder_id: Option<&str>,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Folder, String> {
    let pool = &*db_instance.lock().await;
    let created_request = models::upsert_folder(
        pool,
        models::Folder {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            folder_id: folder_id.map(|s| s.to_string()),
            sort_priority,
            ..Default::default()
        },
    )
    .await
    .expect("Failed to create folder");

    emit_and_return(&window, "created_model", created_request)
}

#[tauri::command]
async fn update_folder(
    folder: models::Folder,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Folder, String> {
    let pool = &*db_instance.lock().await;
    let updated_folder = models::upsert_folder(pool, folder)
        .await
        .expect("Failed to update request");
    emit_and_return(&window, "updated_model", updated_folder)
}

#[tauri::command]
async fn delete_folder(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    folder_id: &str,
) -> Result<models::Folder, String> {
    let pool = &*db_instance.lock().await;
    let req = models::delete_folder(folder_id, pool)
        .await
        .expect("Failed to delete folder");
    emit_and_return(&window, "deleted_model", req)
}

#[tauri::command]
async fn delete_environment(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    environment_id: &str,
) -> Result<models::Environment, String> {
    let pool = &*db_instance.lock().await;
    let req = models::delete_environment(environment_id, pool)
        .await
        .expect("Failed to delete environment");
    emit_and_return(&window, "deleted_model", req)
}

#[tauri::command]
async fn list_requests(
    workspace_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::HttpRequest>, String> {
    let pool = &*db_instance.lock().await;
    models::find_requests(workspace_id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_environments(
    workspace_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::Environment>, String> {
    let pool = &*db_instance.lock().await;
    let environments = models::find_environments(workspace_id, pool)
        .await
        .expect("Failed to find environments");

    Ok(environments)
}

#[tauri::command]
async fn get_folder(
    id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Folder, String> {
    let pool = &*db_instance.lock().await;
    models::get_folder(id, pool)
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
async fn get_environment(
    id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Environment, String> {
    let pool = &*db_instance.lock().await;
    models::get_environment(id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_workspace(
    id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Workspace, String> {
    let pool = &*db_instance.lock().await;
    models::get_workspace(id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_responses(
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
async fn list_workspaces(
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::Workspace>, String> {
    let pool = &*db_instance.lock().await;
    let workspaces = models::find_workspaces(pool)
        .await
        .expect("Failed to find workspaces");
    if workspaces.is_empty() {
        let workspace = models::upsert_workspace(
            pool,
            models::Workspace {
                name: "My Project".to_string(),
                ..Default::default()
            },
        )
        .await
        .expect("Failed to create workspace");
        Ok(vec![workspace])
    } else {
        Ok(workspaces)
    }
}

#[tauri::command]
async fn new_window(window: Window<Wry>, url: &str) -> Result<(), String> {
    create_window(&window.app_handle(), Some(url));
    Ok(())
}

#[tauri::command]
async fn delete_workspace(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    workspace_id: &str,
) -> Result<models::Workspace, String> {
    let pool = &*db_instance.lock().await;
    let workspace = models::delete_workspace(workspace_id, pool)
        .await
        .expect("Failed to delete workspace");
    emit_and_return(&window, "deleted_model", workspace)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
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
                let m = Mutex::new(pool.clone());
                migrate_db(app.handle(), &m)
                    .await
                    .expect("Failed to migrate database");
                app.manage(m);

                // TODO: Move this somewhere better
                match app.get_cli_matches() {
                    Ok(matches) => {
                        let cmd = matches.subcommand.unwrap_or_default();
                        if cmd.name == "import" {
                            let arg_file = cmd
                                .matches
                                .args
                                .get("file")
                                .unwrap()
                                .value
                                .as_str()
                                .unwrap();
                            plugin::run_plugin_import(
                                &app.handle(),
                                &pool,
                                "insomnia-importer",
                                arg_file,
                            )
                            .await;
                            exit(0);
                        } else if cmd.name == "hello" {
                            plugin::run_plugin_hello(&app.handle(), "hello-world");
                            exit(0);
                        }
                    }
                    Err(e) => {
                        println!("Nothing found: {}", e);
                    }
                }

                Ok(())
            })
        })
        .invoke_handler(tauri::generate_handler![
            create_environment,
            create_folder,
            create_request,
            create_workspace,
            delete_all_responses,
            delete_environment,
            delete_folder,
            delete_request,
            delete_response,
            delete_workspace,
            duplicate_request,
            get_key_value,
            get_environment,
            get_folder,
            get_request,
            get_workspace,
            import_data,
            list_environments,
            list_folders,
            list_requests,
            list_responses,
            list_workspaces,
            new_window,
            send_ephemeral_request,
            send_request,
            set_key_value,
            update_environment,
            update_folder,
            update_request,
            update_workspace,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| match event {
            RunEvent::Ready => {
                let w = create_window(app_handle, None);
                w.restore_state(StateFlags::all())
                    .expect("Failed to restore window state");
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

fn create_window(handle: &AppHandle<Wry>, url: Option<&str>) -> Window<Wry> {
    let mut app_menu = window_menu::os_default("Yaak".to_string().as_str());
    if is_dev() {
        let submenu = Submenu::new(
            "Developer",
            Menu::new()
                .add_item(
                    CustomMenuItem::new("refresh".to_string(), "Refresh")
                        .accelerator("CmdOrCtrl + Shift + r"),
                )
                .add_item(
                    CustomMenuItem::new("toggle_devtools".to_string(), "Open Devtools")
                        .accelerator("CmdOrCtrl + Option + i"),
                ),
        );
        app_menu = app_menu.add_submenu(submenu);
    }

    let window_num = handle.windows().len();
    let window_id = format!("wnd_{}", window_num);
    let mut win_builder = tauri::WindowBuilder::new(
        handle,
        window_id,
        WindowUrl::App(url.unwrap_or_default().into()),
    )
    .menu(app_menu)
    .fullscreen(false)
    .resizable(true)
    .inner_size(1100.0, 600.0)
    .position(
        // Randomly offset so windows don't stack exactly
        100.0 + random::<f64>() * 30.0,
        100.0 + random::<f64>() * 30.0,
    )
    .title(match is_dev() {
        true => "Yaak Dev",
        false => "Yaak",
    });

    // Add macOS-only things
    #[cfg(target_os = "macos")]
    {
        win_builder = win_builder
            .hidden_title(true)
            .title_bar_style(TitleBarStyle::Overlay);
    }

    let win = win_builder.build().expect("failed to build window");

    let win2 = win.clone();
    let handle2 = handle.clone();
    win.on_menu_event(move |event| match event.menu_item_id() {
        "quit" => exit(0),
        "close" => win2.close().unwrap(),
        "zoom_reset" => win2.emit("zoom", 0).unwrap(),
        "zoom_in" => win2.emit("zoom", 1).unwrap(),
        "zoom_out" => win2.emit("zoom", -1).unwrap(),
        "toggle_sidebar" => win2.emit("toggle_sidebar", true).unwrap(),
        "focus_url" => win2.emit("focus_url", true).unwrap(),
        "focus_sidebar" => win2.emit("focus_sidebar", true).unwrap(),
        "send_request" => win2.emit("send_request", true).unwrap(),
        "new_request" => _ = win2.emit("new_request", true).unwrap(),
        "toggle_settings" => _ = win2.emit("toggle_settings", true).unwrap(),
        "duplicate_request" => _ = win2.emit("duplicate_request", true).unwrap(),
        "refresh" => win2.eval("location.reload()").unwrap(),
        "new_window" => _ = create_window(&handle2, None),
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
