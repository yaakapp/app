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
use std::process::exit;

use fern::colors::ColoredLevelConfig;
use log::{debug, info, warn};
use rand::random;
use serde::Serialize;
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

use window_ext::TrafficLightWindowExt;

use crate::analytics::{AnalyticsAction, AnalyticsResource, track_event};
use crate::plugin::{ImportResources, ImportResult};
use crate::send::actually_send_request;
use crate::updates::{update_mode_from_str, UpdateMode, YaakUpdater};

mod analytics;
mod models;
mod plugin;
mod render;
mod send;
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
    info!("Migrations complete");
    Ok(())
}

#[tauri::command]
async fn send_ephemeral_request(
    mut request: models::HttpRequest,
    environment_id: Option<&str>,
    app_handle: AppHandle<Wry>,
    db_instance: State<'_, Mutex<Pool<Sqlite>>>,
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;
    let response = models::HttpResponse::new();
    let environment_id2 = environment_id.unwrap_or("n/a").to_string();
    request.id = "".to_string();
    actually_send_request(request, &response, &environment_id2, &app_handle, pool).await
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
) -> Result<models::HttpResponse, String> {
    let pool = &*db_instance.lock().await;

    let req = models::get_request(request_id, pool)
        .await
        .expect("Failed to get request");

    let response = models::create_response(&req.id, 0, "", 0, None, None, None, vec![], pool)
        .await
        .expect("Failed to create response");

    let response2 = response.clone();
    let environment_id2 = environment_id.unwrap_or("n/a").to_string();
    let app_handle2 = window.app_handle().clone();
    let pool2 = pool.clone();

    tokio::spawn(async move {
        if let Err(e) =
            actually_send_request(req, &response2, &environment_id2, &app_handle2, &pool2).await
        {
            response_err(&response2, e, &app_handle2, &pool2)
                .await
                .expect("Failed to update response");
        }
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
    response.elapsed = -1;
    response.error = Some(error.clone());
    response = models::update_response_if_id(&response, pool)
        .await
        .expect("Failed to update response");
    emit_side_effect(app_handle, "updated_model", &response);
    Ok(response)
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
    .expect("Failed to create Workspace");

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
) -> Result<(), String> {
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
                .level_for("reqwest", log::LevelFilter::Debug)
                .with_colors(ColoredLevelConfig::default())
                .level(log::LevelFilter::Trace)
                .build(),
        )
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let dir = match is_dev() {
                true => current_dir().unwrap(),
                false => app.path_resolver().app_data_dir().unwrap(),
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
            println!("Connecting to database at {}", url);

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
            export_data,
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
            set_update_mode,
            update_environment,
            update_folder,
            update_request,
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
                    w.restore_state(StateFlags::all())
                        .expect("Failed to restore window state");

                    track_event(
                        app_handle,
                        AnalyticsResource::App,
                        AnalyticsAction::Launch,
                        None,
                    );
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
    #[cfg(dev)] {
        return true;
    }
    #[cfg(not(dev))] {
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

async fn get_update_mode(pool: &Pool<Sqlite>) -> UpdateMode {
    let mode = models::get_key_value_string("app", "update_mode", pool).await;
    match mode {
        Some(mode) => update_mode_from_str(&mode),
        None => UpdateMode::Stable,
    }
}
