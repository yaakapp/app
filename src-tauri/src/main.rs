#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate core;
#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use std::env::current_dir;
use std::fs::{create_dir_all, File, read_to_string};
use std::process::exit;

use fern::colors::ColoredLevelConfig;
use log::{debug, error, info, warn};
use rand::random;
use serde::Serialize;
use serde_json::Value;
use sqlx::{Pool, Sqlite, SqlitePool};
use sqlx::migrate::Migrator;
use sqlx::types::Json;
use tauri::{AppHandle, RunEvent, State, Window, WindowUrl, Wry};
use tauri::{Manager, WindowEvent};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri_plugin_log::{fern, LogTarget};
use tauri_plugin_window_state::{StateFlags, WindowExt};
use tokio::sync::Mutex;
use tokio::time::sleep;
use window_shadows::set_shadow;

use window_ext::TrafficLightWindowExt;

use crate::analytics::{AnalyticsAction, AnalyticsResource};
use crate::http::send_http_request;
use crate::plugin::{ImportResources, ImportResult};
use crate::updates::{update_mode_from_str, UpdateMode, YaakUpdater};

mod analytics;
mod http;
mod models;
mod plugin;
mod render;
mod updates;
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
    info!("Running migrations at {}", p.to_string_lossy());
    let m = Migrator::new(p).await.expect("Failed to load migrations");
    m.run(pool).await.expect("Failed to run migrations");
    info!("Migrations complete!");
    Ok(())
}

#[tauri::command]
async fn send_ephemeral_request(
    mut request: models::HttpRequest,
    environment_id: Option<&str>,
    cookie_jar_id: Option<&str>,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let response = models::HttpResponse::new();
    request.id = "".to_string();
    let environment = match environment_id {
        Some(id) => Some(
            models::get_environment(id, pool)
                .await
                .expect("Failed to get environment"),
        ),
        None => None,
    };
    let cookie_jar = match cookie_jar_id {
        Some(id) => Some(
            models::get_cookie_jar(id, pool)
                .await
                .expect("Failed to get cookie jar"),
        ),
        None => None,
    };

    // let cookie_jar_id2 = cookie_jar_id.unwrap_or("").to_string();
    send_http_request(
        request,
        &response,
        environment,
        cookie_jar,
        &app_handle,
        pool,
        None,
    )
    .await
}

#[tauri::command]
async fn filter_response(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    response_id: &str,
    filter: &str,
) -> Result<String, String> {
    let pool = &*db_instance.lock().await;
    let response = models::get_response(response_id, pool)
        .await
        .expect("Failed to get response");

    if let None = response.body_path {
        return Err("Response body not found".to_string());
    }

    let mut content_type = "".to_string();
    for header in response.headers.iter() {
        if header.name.to_lowercase() == "content-type" {
            content_type = header.value.to_string().to_lowercase();
            break;
        }
    }

    // TODO: Have plugins register their own content type (regex?)
    let plugin_name = if content_type.contains("json") {
        "filter-jsonpath"
    } else {
        "filter-xpath"
    };

    let body = read_to_string(response.body_path.unwrap()).unwrap();
    let filter_result = plugin::run_plugin_filter(&window.app_handle(), plugin_name, filter, &body)
        .await
        .expect("Failed to run filter");
    Ok(filter_result.filtered)
}

#[tauri::command]
async fn import_data(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    file_paths: Vec<&str>,
) -> Result<ImportResources, String> {
    let pool = &*db_instance.lock().await;
    let mut result: Option<ImportResult> = None;
    let plugins = vec!["importer-yaak", "importer-insomnia", "importer-postman"];
    for plugin_name in plugins {
        if let Some(r) = plugin::run_plugin_import(
            &window.app_handle(),
            plugin_name,
            file_paths.first().unwrap(),
        )
        .await
        {
            result = Some(r);
            break;
        }
    }

    match result {
        None => Err("No importers found for the chosen file".to_string()),
        Some(r) => {
            let mut imported_resources = ImportResources::default();

            info!("Importing resources");
            for w in r.resources.workspaces {
                let x = models::upsert_workspace(pool, w)
                    .await
                    .expect("Failed to create workspace");
                imported_resources.workspaces.push(x.clone());
                info!("Imported workspace: {}", x.name);
            }

            for e in r.resources.environments {
                let x = models::upsert_environment(pool, e)
                    .await
                    .expect("Failed to create environment");
                imported_resources.environments.push(x.clone());
                info!("Imported environment: {}", x.name);
            }

            for f in r.resources.folders {
                let x = models::upsert_folder(pool, f)
                    .await
                    .expect("Failed to create folder");
                imported_resources.folders.push(x.clone());
                info!("Imported folder: {}", x.name);
            }

            for r in r.resources.requests {
                let x = models::upsert_request(pool, r)
                    .await
                    .expect("Failed to create request");
                imported_resources.requests.push(x.clone());
                info!("Imported request: {}", x.name);
            }

            Ok(imported_resources)
        }
    }
}

#[tauri::command]
async fn export_data(
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    export_path: &str,
    workspace_id: &str,
) -> Result<(), String> {
    let pool = &*db_instance.lock().await;
    let export_data = models::get_workspace_export_resources(&app_handle, pool, workspace_id).await;
    let f = File::options()
        .create(true)
        .truncate(true)
        .write(true)
        .open(export_path)
        .expect("Unable to create file");
    serde_json::to_writer_pretty(&f, &export_data)
        .map_err(|e| e.to_string())
        .expect("Failed to write");
    f.sync_all().expect("Failed to sync");
    info!("Exported Yaak workspace to {:?}", export_path);
    Ok(())
}

#[tauri::command]
async fn send_request(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    request_id: &str,
    environment_id: Option<&str>,
    cookie_jar_id: Option<&str>,
    download_dir: Option<&str>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let app_handle = window.app_handle();

    let request = models::get_request(request_id, pool)
        .await
        .expect("Failed to get request");

    let environment = match environment_id {
        Some(id) => Some(
            models::get_environment(id, pool)
                .await
                .expect("Failed to get environment"),
        ),
        None => None,
    };

    let cookie_jar = match cookie_jar_id {
        Some(id) => Some(
            models::get_cookie_jar(id, pool)
                .await
                .expect("Failed to get cookie jar"),
        ),
        None => None,
    };

    let response = models::create_response(&request.id, 0, "", 0, None, None, None, vec![], pool)
        .await
        .expect("Failed to create response");

    let download_path = if let Some(p) = download_dir {
        Some(std::path::Path::new(p).to_path_buf())
    } else {
        None
    };

    emit_side_effect(&app_handle, "created_model", response.clone());

    send_http_request(
        request.clone(),
        &response,
        environment,
        cookie_jar,
        &app_handle,
        &pool,
        download_path,
    )
    .await
}

async fn response_err(
    response: &models::HttpResponse,
    error: String,
    app_handle: &AppHandle<Wry>,
    pool: &Pool<Sqlite>,
) -> Result<models::HttpResponse, String> {
    let mut response = response.clone();
    response.elapsed = -1;
    response.error = Some(error.clone());
    response = models::update_response_if_id(&response, pool)
        .await
        .expect("Failed to update response");
    emit_side_effect(app_handle, "updated_model", &response);
    Ok(response)
}

#[tauri::command]
async fn track_event(
    window: Window<Wry>,
    resource: &str,
    action: &str,
    attributes: Option<Value>,
) -> Result<(), String> {
    match (
        AnalyticsResource::from_str(resource),
        AnalyticsAction::from_str(action),
    ) {
        (Some(resource), Some(action)) => {
            analytics::track_event(&window.app_handle(), resource, action, attributes).await;
        }
        _ => {
            error!("Invalid action/resource for track_event: {action} {resource}");
            return Err("Invalid event".to_string());
        }
    };
    Ok(())
}

#[tauri::command]
async fn set_update_mode(
    update_mode: &str,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::KeyValue, String> {
    set_key_value("app", "update_mode", update_mode, window, db_instance).await
}

#[tauri::command]
async fn get_key_value(
    namespace: &str,
    key: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Option<models::KeyValue>, ()> {
    let pool = &*db_instance.lock().await;
    let result = models::get_key_value_raw(namespace, key, pool).await;
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
    let (key_value, created) = models::set_key_value_raw(namespace, key, value, pool).await;

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
    let created_workspace =
        models::upsert_workspace(pool, models::Workspace::new(name.to_string()))
            .await
            .expect("Failed to create Workspace");

    emit_and_return(&window, "created_model", created_workspace)
}

#[tauri::command]
async fn update_cookie_jar(
    cookie_jar: models::CookieJar,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::CookieJar, String> {
    let pool = &*db_instance.lock().await;
    println!("Updating cookie jar {}", cookie_jar.cookies.len());

    let updated = models::upsert_cookie_jar(pool, &cookie_jar)
        .await
        .expect("Failed to update cookie jar");

    emit_and_return(&window, "updated_model", updated)
}

#[tauri::command]
async fn delete_cookie_jar(
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    cookie_jar_id: &str,
) -> Result<models::CookieJar, String> {
    let pool = &*db_instance.lock().await;
    let req = models::delete_cookie_jar(cookie_jar_id, pool)
        .await
        .expect("Failed to delete cookie jar");
    emit_and_return(&window, "deleted_model", req)
}

#[tauri::command]
async fn create_cookie_jar(
    workspace_id: &str,
    name: &str,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::CookieJar, String> {
    let pool = &*db_instance.lock().await;
    let created_cookie_jar = models::upsert_cookie_jar(
        pool,
        &models::CookieJar {
            name: name.to_string(),
            workspace_id: workspace_id.to_string(),
            ..Default::default()
        },
    )
    .await
    .expect("Failed to create cookie jar");

    emit_and_return(&window, "created_model", created_cookie_jar)
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
    let requests = models::find_requests(workspace_id, pool)
        .await
        .expect("Failed to find requests");
    // .map_err(|e| e.to_string())
    Ok(requests)
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
async fn get_settings(db_instance: State<'_, Mutex<Pool<Sqlite>>>) -> Result<models::Settings, ()> {
    let pool = &*db_instance.lock().await;
    Ok(models::get_or_create_settings(pool).await)
}

#[tauri::command]
async fn update_settings(
    settings: models::Settings,
    window: Window<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::Settings, String> {
    let pool = &*db_instance.lock().await;

    let updated_settings = models::update_settings(pool, settings)
        .await
        .expect("Failed to update settings");

    emit_and_return(&window, "updated_model", updated_settings)
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
async fn get_cookie_jar(
    id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::CookieJar, String> {
    let pool = &*db_instance.lock().await;
    models::get_cookie_jar(id, pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_cookie_jars(
    workspace_id: &str,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::CookieJar>, String> {
    let pool = &*db_instance.lock().await;
    models::find_cookie_jars(workspace_id, pool)
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
    limit: Option<i64>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<Vec<models::HttpResponse>, String> {
    let pool = &*db_instance.lock().await;
    models::find_responses(request_id, limit, pool)
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
                name: "Yaak".to_string(),
                ..Default::default()
            },
        )
        .await
        .expect("Failed to create Workspace");
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
        .expect("Failed to delete Workspace");
    emit_and_return(&window, "deleted_model", workspace)
}

#[tauri::command]
async fn check_for_updates(
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
    yaak_updater: State<'_, Mutex<YaakUpdater>>,
) -> Result<bool, String> {
    let pool = &*db_instance.lock().await;
    let update_mode = get_update_mode(pool).await;
    yaak_updater
        .lock()
        .await
        .force_check(&app_handle, update_mode)
        .await
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .level_for("tao", log::LevelFilter::Info)
                .level_for("sqlx", log::LevelFilter::Warn)
                .level_for("hyper", log::LevelFilter::Info)
                .level_for("tracing", log::LevelFilter::Info)
                .level_for("reqwest", log::LevelFilter::Info)
                .level_for("tokio_util", log::LevelFilter::Info)
                .level_for("cookie_store", log::LevelFilter::Info)
                .with_colors(ColoredLevelConfig::default())
                .level(log::LevelFilter::Trace)
                .build(),
        )
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let app_data_dir = app.path_resolver().app_data_dir().unwrap();
            let app_config_dir = app.path_resolver().app_config_dir().unwrap();
            info!(
                "App Config Dir: {}",
                app_config_dir.as_path().to_string_lossy(),
            );
            info!("App Data Dir: {}", app_data_dir.as_path().to_string_lossy(),);
            let dir = match is_dev() {
                true => current_dir().unwrap(),
                false => app_data_dir,
            };

            create_dir_all(dir.clone()).expect("Problem creating App directory!");
            let p = dir.join("db.sqlite");
            File::options()
                .write(true)
                .create(true)
                .open(&p)
                .expect("Problem creating database file!");

            let p_string = p.to_string_lossy().replace(' ', "%20");
            let url = format!("sqlite://{}?mode=rwc", p_string);
            info!("Connecting to database at {}", url);

            tauri::async_runtime::block_on(async move {
                let pool = SqlitePool::connect(p.to_str().unwrap())
                    .await
                    .expect("Failed to connect to database");

                // Setup the DB handle
                let m = Mutex::new(pool.clone());
                migrate_db(app.handle(), &m)
                    .await
                    .expect("Failed to migrate database");
                app.manage(m);

                let yaak_updater = YaakUpdater::new();
                app.manage(Mutex::new(yaak_updater));

                let _ = models::cancel_pending_responses(&pool).await;

                Ok(())
            })
        })
        .invoke_handler(tauri::generate_handler![
            check_for_updates,
            create_cookie_jar,
            create_environment,
            create_folder,
            create_request,
            create_workspace,
            delete_all_responses,
            delete_cookie_jar,
            delete_environment,
            delete_folder,
            delete_request,
            delete_response,
            delete_workspace,
            duplicate_request,
            export_data,
            filter_response,
            get_cookie_jar,
            get_environment,
            get_folder,
            get_key_value,
            get_request,
            get_settings,
            get_workspace,
            import_data,
            list_cookie_jars,
            list_environments,
            list_folders,
            list_requests,
            list_responses,
            list_workspaces,
            new_window,
            send_ephemeral_request,
            send_request,
            set_key_value,
            set_update_mode,
            track_event,
            update_cookie_jar,
            update_environment,
            update_folder,
            update_request,
            update_settings,
            update_workspace,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            match event {
                RunEvent::Updater(updater_event) => match updater_event {
                    tauri::UpdaterEvent::Pending => {
                        debug!("Updater pending");
                    }
                    tauri::UpdaterEvent::Updated => {
                        debug!("Updater updated");
                    }
                    tauri::UpdaterEvent::UpdateAvailable {
                        body,
                        version,
                        date: _,
                    } => {
                        debug!("Updater update available body={} version={}", body, version);
                    }
                    tauri::UpdaterEvent::Downloaded => {
                        debug!("Updater downloaded");
                    }
                    tauri::UpdaterEvent::Error(e) => {
                        warn!("Updater received error: {:?}", e);
                    }
                    _ => {}
                },
                RunEvent::Ready => {
                    let w = create_window(app_handle, None);
                    if let Err(e) = w.restore_state(StateFlags::all()) {
                        error!("Failed to restore window state {}", e);
                    }

                    let h = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        let info = analytics::track_launch_event(&h).await;
                        info!("Launched Yaak {:?}", info);

                        // Wait for window render and give a chance for the user to notice
                        if info.launched_after_update && info.num_launches > 1 {
                            sleep(std::time::Duration::from_secs(5)).await;
                            let _ = w.emit("show_changelog", true);
                        }
                    });
                }
                RunEvent::WindowEvent {
                    label: _label,
                    event: WindowEvent::Focused(true),
                    ..
                } => {
                    let h = app_handle.clone();
                    // Run update check whenever window is focused
                    tauri::async_runtime::spawn(async move {
                        let val: State<'_, Mutex<YaakUpdater>> = h.state();
                        let db_instance: State<'_, Mutex<Pool<Sqlite>>> = h.state();
                        let pool = &*db_instance.lock().await;
                        let update_mode = get_update_mode(pool).await;
                        _ = val.lock().await.check(&h, update_mode).await;
                    });
                }
                _ => {}
            };
        });
}

fn is_dev() -> bool {
    #[cfg(dev)]
    {
        return true;
    }
    #[cfg(not(dev))]
    {
        return false;
    }
}

fn create_window(handle: &AppHandle<Wry>, url: Option<&str>) -> Window<Wry> {
    let app_menu = window_menu::os_default("Yaak".to_string().as_str());
    let window_num = handle.windows().len();
    let window_id = format!("wnd_{}", window_num);
    let mut win_builder = tauri::WindowBuilder::new(
        handle,
        window_id,
        WindowUrl::App(url.unwrap_or_default().into()),
    )
    .fullscreen(false)
    .resizable(true)
    .inner_size(1100.0, 600.0)
    .position(
        // Randomly offset so windows don't stack exactly
        100.0 + random::<f64>() * 30.0,
        100.0 + random::<f64>() * 30.0,
    )
    .title(handle.package_info().name.to_string());

    // Add macOS-only things
    #[cfg(target_os = "macos")]
    {
        win_builder = win_builder
            .menu(app_menu)
            .hidden_title(true)
            .title_bar_style(TitleBarStyle::Overlay);
    }

    // Add non-MacOS things
    #[cfg(not(target_os = "macos"))]
    {
        // Doesn't seem to work from Rust, here, so we do it in JS
        win_builder = win_builder.decorations(false);
    }

    let win = win_builder.build().expect("failed to build window");

    // Tauri doesn't support shadows when hiding decorations, so we add our own
    #[cfg(any(windows, target_os = "macos"))]
    set_shadow(&win, true).unwrap();

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
        "new_request" => win2.emit("new_request", true).unwrap(),
        "toggle_settings" => win2.emit("toggle_settings", true).unwrap(),
        "duplicate_request" => win2.emit("duplicate_request", true).unwrap(),
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
            WindowEvent::Focused(..) => apply_offset(),
            WindowEvent::ScaleFactorChanged { .. } => apply_offset(),
            WindowEvent::CloseRequested { .. } => {
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

async fn get_update_mode(pool: &Pool<Sqlite>) -> UpdateMode {
    let settings = models::get_or_create_settings(pool).await;
    update_mode_from_str(settings.update_channel.as_str())
}
