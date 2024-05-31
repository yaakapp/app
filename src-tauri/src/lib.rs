extern crate core;
#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use std::collections::HashMap;
use std::env::current_dir;
use std::fs;
use std::fs::{create_dir_all, read_to_string, File};
use std::path::PathBuf;
use std::process::exit;
use std::str::FromStr;
use std::time::Duration;

use ::http::uri::InvalidUri;
use ::http::Uri;
use base64::Engine;
use fern::colors::ColoredLevelConfig;
use log::{debug, error, info, warn};
use rand::random;
use serde_json::{json, Value};
use sqlx::migrate::Migrator;
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::types::Json;
use sqlx::{Pool, Sqlite, SqlitePool};
use tauri::path::BaseDirectory;
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri::{AppHandle, LogicalSize, RunEvent, State, WebviewUrl, WebviewWindow};
use tauri::{Manager, WindowEvent};
use tauri_plugin_log::{fern, Target, TargetKind};
use tauri_plugin_shell::ShellExt;
use tokio::sync::Mutex;

use ::grpc::manager::{DynamicMessage, GrpcHandle};
use ::grpc::{deserialize_message, serialize_message, Code, ServiceDefinition};

use crate::analytics::{AnalyticsAction, AnalyticsResource};
use crate::grpc::metadata_to_map;
use crate::http_request::send_http_request;
use crate::models::{
    cancel_pending_grpc_connections, cancel_pending_responses, create_http_response,
    delete_all_grpc_connections, delete_all_http_responses, delete_cookie_jar, delete_environment,
    delete_folder, delete_grpc_connection, delete_grpc_request, delete_http_request,
    delete_http_response, delete_workspace, duplicate_grpc_request, duplicate_http_request,
    generate_model_id, get_cookie_jar, get_environment, get_folder, get_grpc_connection,
    get_grpc_request, get_http_request, get_http_response, get_key_value_raw,
    get_or_create_settings, get_workspace, get_workspace_export_resources, list_cookie_jars,
    list_environments, list_folders, list_grpc_connections, list_grpc_events, list_grpc_requests,
    list_http_requests, list_responses, list_workspaces, set_key_value_raw, update_response_if_id,
    update_settings, upsert_cookie_jar, upsert_environment, upsert_folder, upsert_grpc_connection,
    upsert_grpc_event, upsert_grpc_request, upsert_http_request, upsert_workspace, CookieJar,
    Environment, EnvironmentVariable, Folder, GrpcConnection, GrpcEvent, GrpcEventType,
    GrpcRequest, HttpRequest, HttpResponse, KeyValue, ModelType, Settings, Workspace,
    WorkspaceExportResources,
};
use crate::notifications::YaakNotifier;
use crate::plugin::{run_plugin_export_curl, run_plugin_import, ImportResult};
use crate::render::render_request;
use crate::updates::{UpdateMode, YaakUpdater};
use crate::window_menu::app_menu;

mod analytics;
mod grpc;
mod http_request;
mod models;
mod notifications;
mod plugin;
mod render;
#[cfg(target_os = "macos")]
mod tauri_plugin_mac_window;
#[cfg(target_os = "windows")]
mod tauri_plugin_windows_window;
mod updates;
mod window_menu;

const DEFAULT_WINDOW_WIDTH: f64 = 1100.0;
const DEFAULT_WINDOW_HEIGHT: f64 = 600.0;

async fn migrate_db(app_handle: &AppHandle, db: &Mutex<Pool<Sqlite>>) -> Result<(), String> {
    let pool = &*db.lock().await;
    let p = app_handle
        .path()
        .resolve("migrations", BaseDirectory::Resource)
        .expect("failed to resolve resource");
    info!("Running migrations at {}", p.to_string_lossy());
    let mut m = Migrator::new(p).await.expect("Failed to load migrations");
    m.set_ignore_missing(true); // So we can rollback versions and not crash
    m.run(pool).await.expect("Failed to run migrations");
    info!("Migrations complete!");
    Ok(())
}

#[derive(serde::Serialize)]
#[serde(default, rename_all = "camelCase")]
struct AppMetaData {
    is_dev: bool,
    version: String,
    name: String,
    app_data_dir: String,
    app_log_dir: String,
}

#[tauri::command]
async fn cmd_metadata(app_handle: AppHandle) -> Result<AppMetaData, ()> {
    let app_data_dir = app_handle.path().app_data_dir().unwrap();
    let app_log_dir = app_handle.path().app_log_dir().unwrap();
    return Ok(AppMetaData {
        is_dev: is_dev(),
        version: app_handle.package_info().version.to_string(),
        name: app_handle.package_info().name.to_string(),
        app_data_dir: app_data_dir.to_string_lossy().to_string(),
        app_log_dir: app_log_dir.to_string_lossy().to_string(),
    });
}

#[tauri::command]
async fn cmd_dismiss_notification(
    app: AppHandle,
    notification_id: &str,
    yaak_notifier: State<'_, Mutex<YaakNotifier>>,
) -> Result<(), String> {
    info!("SEEN? {notification_id}");
    yaak_notifier.lock().await.seen(&app, notification_id).await
}

#[tauri::command]
async fn cmd_grpc_reflect(
    request_id: &str,
    proto_files: Vec<String>,
    window: WebviewWindow,
    grpc_handle: State<'_, Mutex<GrpcHandle>>,
) -> Result<Vec<ServiceDefinition>, String> {
    let req = get_grpc_request(&window, request_id)
        .await
        .map_err(|e| e.to_string())?;
    let uri = safe_uri(&req.url).map_err(|e| e.to_string())?;
    if proto_files.len() > 0 {
        grpc_handle
            .lock()
            .await
            .services_from_files(
                &req.id,
                &uri,
                proto_files
                    .iter()
                    .map(|p| PathBuf::from_str(p).unwrap())
                    .collect(),
            )
            .await
    } else {
        grpc_handle
            .lock()
            .await
            .services_from_reflection(&req.id, &uri)
            .await
    }
}

#[tauri::command]
async fn cmd_grpc_go(
    request_id: &str,
    environment_id: Option<&str>,
    proto_files: Vec<String>,
    w: WebviewWindow,
    grpc_handle: State<'_, Mutex<GrpcHandle>>,
) -> Result<String, String> {
    let req = get_grpc_request(&w, request_id)
        .await
        .map_err(|e| e.to_string())?;
    let environment = match environment_id {
        Some(id) => Some(get_environment(&w, id).await.map_err(|e| e.to_string())?),
        None => None,
    };
    let workspace = get_workspace(&w, &req.workspace_id)
        .await
        .map_err(|e| e.to_string())?;
    let mut metadata = HashMap::new();

    // Add rest of metadata
    for h in req.clone().metadata.0 {
        if h.name.is_empty() && h.value.is_empty() {
            continue;
        }

        if !h.enabled {
            continue;
        }

        let name = render::render(&h.name, &workspace, environment.as_ref());
        let value = render::render(&h.value, &workspace, environment.as_ref());

        metadata.insert(name, value);
    }

    if let Some(b) = &req.authentication_type {
        let req = req.clone();
        let environment_ref = environment.as_ref();
        let empty_value = &serde_json::to_value("").unwrap();
        let a = req.authentication.0;

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
            metadata.insert("Authorization".to_string(), format!("Basic {}", encoded));
        } else if b == "bearer" {
            let raw_token = a.get("token").unwrap_or(empty_value).as_str().unwrap_or("");
            let token = render::render(raw_token, &workspace, environment_ref);
            metadata.insert("Authorization".to_string(), format!("Bearer {token}"));
        }
    }

    let conn = {
        let req = req.clone();
        upsert_grpc_connection(
            &w,
            &GrpcConnection {
                workspace_id: req.workspace_id,
                request_id: req.id,
                status: -1,
                url: req.url.clone(),
                ..Default::default()
            },
        )
        .await
        .map_err(|e| e.to_string())?
    };
    let conn_id = conn.id.clone();

    let base_msg = GrpcEvent {
        workspace_id: req.clone().workspace_id,
        request_id: req.clone().id,
        connection_id: conn.clone().id,
        ..Default::default()
    };

    let (in_msg_tx, in_msg_rx) = tauri::async_runtime::channel::<DynamicMessage>(16);
    let maybe_in_msg_tx = std::sync::Mutex::new(Some(in_msg_tx.clone()));
    let (cancelled_tx, mut cancelled_rx) = tokio::sync::watch::channel(false);

    let uri = safe_uri(&req.url).map_err(|e| e.to_string())?;

    let in_msg_stream = tokio_stream::wrappers::ReceiverStream::new(in_msg_rx);

    let (service, method) = {
        let req = req.clone();
        match (req.service, req.method) {
            (Some(service), Some(method)) => (service, method),
            _ => return Err("Service and method are required".to_string()),
        }
    };

    let start = std::time::Instant::now();
    let connection = grpc_handle
        .lock()
        .await
        .connect(
            &req.clone().id,
            uri,
            proto_files
                .iter()
                .map(|p| PathBuf::from_str(p).unwrap())
                .collect(),
        )
        .await?;

    let method_desc = connection
        .method(&service, &method)
        .map_err(|e| e.to_string())?;

    #[derive(serde::Deserialize)]
    enum IncomingMsg {
        Message(String),
        Cancel,
        Commit,
    }

    let cb = {
        let cancelled_rx = cancelled_rx.clone();
        let environment = environment.clone();
        let workspace = workspace.clone();
        let w = w.clone();
        let base_msg = base_msg.clone();
        let method_desc = method_desc.clone();

        move |ev: tauri::Event| {
            if *cancelled_rx.borrow() {
                // Stream is cancelled
                return;
            }

            let mut maybe_in_msg_tx = maybe_in_msg_tx
                .lock()
                .expect("previous holder not to panic");
            let in_msg_tx = if let Some(in_msg_tx) = maybe_in_msg_tx.as_ref() {
                in_msg_tx
            } else {
                // This would mean that the stream is already committed because
                // we have already dropped the sending half
                return;
            };

            match serde_json::from_str::<IncomingMsg>(ev.payload()) {
                Ok(IncomingMsg::Message(raw_msg)) => {
                    let w = w.clone();
                    let base_msg = base_msg.clone();
                    let environment_ref = environment.as_ref();
                    let method_desc = method_desc.clone();
                    let msg = render::render(raw_msg.as_str(), &workspace, environment_ref);
                    let d_msg: DynamicMessage = match deserialize_message(msg.as_str(), method_desc)
                    {
                        Ok(d_msg) => d_msg,
                        Err(e) => {
                            tauri::async_runtime::spawn(async move {
                                upsert_grpc_event(
                                    &w,
                                    &GrpcEvent {
                                        event_type: GrpcEventType::Error,
                                        content: e.to_string(),
                                        ..base_msg.clone()
                                    },
                                )
                                .await
                                .unwrap();
                            });
                            return;
                        }
                    };
                    in_msg_tx.try_send(d_msg).unwrap();
                    tauri::async_runtime::spawn(async move {
                        upsert_grpc_event(
                            &w,
                            &GrpcEvent {
                                content: msg,
                                event_type: GrpcEventType::ClientMessage,
                                ..base_msg.clone()
                            },
                        )
                        .await
                        .unwrap();
                    });
                }
                Ok(IncomingMsg::Commit) => {
                    maybe_in_msg_tx.take();
                }
                Ok(IncomingMsg::Cancel) => {
                    cancelled_tx.send_replace(true);
                }
                Err(e) => {
                    error!("Failed to parse gRPC message: {:?}", e);
                }
            }
        }
    };
    let event_handler = w.listen_any(format!("grpc_client_msg_{}", conn.id).as_str(), cb);

    let grpc_listen = {
        let w = w.clone();
        let base_event = base_msg.clone();
        let req = req.clone();
        let workspace = workspace.clone();
        let environment = environment.clone();
        let raw_msg = if req.message.is_empty() {
            "{}".to_string()
        } else {
            req.message
        };
        let msg = render::render(&raw_msg, &workspace, environment.as_ref());

        upsert_grpc_event(
            &w,
            &GrpcEvent {
                content: format!("Connecting to {}", req.url),
                event_type: GrpcEventType::ConnectionStart,
                metadata: Json(metadata.clone()),
                ..base_event.clone()
            },
        )
        .await
        .unwrap();

        async move {
            let (maybe_stream, maybe_msg) = match (
                method_desc.is_client_streaming(),
                method_desc.is_server_streaming(),
            ) {
                (true, true) => (
                    Some(
                        connection
                            .streaming(&service, &method, in_msg_stream, metadata)
                            .await,
                    ),
                    None,
                ),
                (true, false) => (
                    None,
                    Some(
                        connection
                            .client_streaming(&service, &method, in_msg_stream, metadata)
                            .await,
                    ),
                ),
                (false, true) => (
                    Some(
                        connection
                            .server_streaming(&service, &method, &msg, metadata)
                            .await,
                    ),
                    None,
                ),
                (false, false) => (
                    None,
                    Some(connection.unary(&service, &method, &msg, metadata).await),
                ),
            };

            if !method_desc.is_client_streaming() {
                upsert_grpc_event(
                    &w,
                    &GrpcEvent {
                        event_type: GrpcEventType::ClientMessage,
                        content: msg,
                        ..base_event.clone()
                    },
                )
                .await
                .unwrap();
            }

            match maybe_msg {
                Some(Ok(msg)) => {
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            metadata: Json(metadata_to_map(msg.metadata().clone())),
                            content: if msg.metadata().len() == 0 {
                                "Received response"
                            } else {
                                "Received response with metadata"
                            }
                            .to_string(),
                            event_type: GrpcEventType::Info,
                            ..base_event.clone()
                        },
                    )
                    .await
                    .unwrap();
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            content: serialize_message(&msg.into_inner()).unwrap(),
                            event_type: GrpcEventType::ServerMessage,
                            ..base_event.clone()
                        },
                    )
                    .await
                    .unwrap();
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            content: "Connection complete".to_string(),
                            event_type: GrpcEventType::ConnectionEnd,
                            status: Some(Code::Ok as i64),
                            ..base_event.clone()
                        },
                    )
                    .await
                    .unwrap();
                }
                Some(Err(e)) => {
                    upsert_grpc_event(
                        &w,
                        &(match e.status {
                            Some(s) => GrpcEvent {
                                error: Some(s.message().to_string()),
                                status: Some(s.code() as i64),
                                content: "Failed to connect".to_string(),
                                metadata: Json(metadata_to_map(s.metadata().clone())),
                                event_type: GrpcEventType::ConnectionEnd,
                                ..base_event.clone()
                            },
                            None => GrpcEvent {
                                error: Some(e.message),
                                status: Some(Code::Unknown as i64),
                                content: "Failed to connect".to_string(),
                                event_type: GrpcEventType::ConnectionEnd,
                                ..base_event.clone()
                            },
                        }),
                    )
                    .await
                    .unwrap();
                }
                None => {
                    // Server streaming doesn't return initial message
                }
            }

            let mut stream = match maybe_stream {
                Some(Ok(stream)) => {
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            metadata: Json(metadata_to_map(stream.metadata().clone())),
                            content: if stream.metadata().len() == 0 {
                                "Received response"
                            } else {
                                "Received response with metadata"
                            }
                            .to_string(),
                            event_type: GrpcEventType::Info,
                            ..base_event.clone()
                        },
                    )
                    .await
                    .unwrap();
                    stream.into_inner()
                }
                Some(Err(e)) => {
                    upsert_grpc_event(
                        &w,
                        &(match e.status {
                            Some(s) => GrpcEvent {
                                error: Some(s.message().to_string()),
                                status: Some(s.code() as i64),
                                content: "Failed to connect".to_string(),
                                metadata: Json(metadata_to_map(s.metadata().clone())),
                                event_type: GrpcEventType::ConnectionEnd,
                                ..base_event.clone()
                            },
                            None => GrpcEvent {
                                error: Some(e.message),
                                status: Some(Code::Unknown as i64),
                                content: "Failed to connect".to_string(),
                                event_type: GrpcEventType::ConnectionEnd,
                                ..base_event.clone()
                            },
                        }),
                    )
                    .await
                    .unwrap();
                    return;
                }
                None => return,
            };

            loop {
                match stream.message().await {
                    Ok(Some(msg)) => {
                        let message = serialize_message(&msg).unwrap();
                        upsert_grpc_event(
                            &w,
                            &GrpcEvent {
                                content: message,
                                event_type: GrpcEventType::ServerMessage,
                                ..base_event.clone()
                            },
                        )
                        .await
                        .unwrap();
                    }
                    Ok(None) => {
                        let trailers = stream
                            .trailers()
                            .await
                            .unwrap_or_default()
                            .unwrap_or_default();
                        upsert_grpc_event(
                            &w,
                            &GrpcEvent {
                                content: "Connection complete".to_string(),
                                status: Some(Code::Unavailable as i64),
                                metadata: Json(metadata_to_map(trailers)),
                                event_type: GrpcEventType::ConnectionEnd,
                                ..base_event.clone()
                            },
                        )
                        .await
                        .unwrap();
                        break;
                    }
                    Err(status) => {
                        upsert_grpc_event(
                            &w,
                            &GrpcEvent {
                                content: status.to_string(),
                                status: Some(status.code() as i64),
                                metadata: Json(metadata_to_map(status.metadata().clone())),
                                event_type: GrpcEventType::ConnectionEnd,
                                ..base_event.clone()
                            },
                        )
                        .await
                        .unwrap();
                    }
                }
            }
        }
    };

    {
        let conn_id = conn_id.clone();
        tauri::async_runtime::spawn(async move {
            let w = w.clone();
            tokio::select! {
                _ = grpc_listen => {
                    let events = list_grpc_events(&w, &conn_id)
                        .await
                        .unwrap();
                    let closed_event = events
                        .iter()
                        .find(|e| GrpcEventType::ConnectionEnd == e.event_type);
                    let closed_status = closed_event.and_then(|e| e.status).unwrap_or(Code::Unavailable as i64);
                    upsert_grpc_connection(
                        &w,
                        &GrpcConnection{
                            elapsed: start.elapsed().as_millis() as i64,
                            status: closed_status,
                            ..get_grpc_connection(&w, &conn_id).await.unwrap().clone()
                        },
                    ).await.unwrap();
                },
                _ = cancelled_rx.changed() => {
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            content: "Cancelled".to_string(),
                            event_type: GrpcEventType::ConnectionEnd,
                            status: Some(Code::Cancelled as i64),
                            ..base_msg.clone()
                        },
                    ).await.unwrap();
                    upsert_grpc_connection(
                        &w,
                        &GrpcConnection {
                            elapsed: start.elapsed().as_millis() as i64,
                            status: Code::Cancelled as i64,
                            ..get_grpc_connection(&w, &conn_id).await.unwrap().clone()
                        },
                    )
                    .await
                    .unwrap();
                },
            }
            w.unlisten(event_handler);
        });
    };

    Ok(conn.id)
}

#[tauri::command]
async fn cmd_send_ephemeral_request(
    mut request: HttpRequest,
    environment_id: Option<&str>,
    cookie_jar_id: Option<&str>,
    window: WebviewWindow,
) -> Result<HttpResponse, String> {
    let response = HttpResponse::new();
    request.id = "".to_string();
    let environment = match environment_id {
        Some(id) => Some(
            get_environment(&window, id)
                .await
                .expect("Failed to get environment"),
        ),
        None => None,
    };
    let cookie_jar = match cookie_jar_id {
        Some(id) => Some(
            get_cookie_jar(&window, id)
                .await
                .expect("Failed to get cookie jar"),
        ),
        None => None,
    };

    let (cancel_tx, mut cancel_rx) = tokio::sync::watch::channel(false);
    window.listen_any(
        format!("cancel_http_response_{}", response.id),
        move |_event| {
            let _ = cancel_tx.send(true);
        },
    );

    send_http_request(
        &window,
        request,
        &response,
        environment,
        cookie_jar,
        None,
        &mut cancel_rx,
    )
    .await
}

#[tauri::command]
async fn cmd_filter_response(
    w: WebviewWindow,
    response_id: &str,
    filter: &str,
) -> Result<String, String> {
    let response = get_http_response(&w, response_id)
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
    let filter_result = plugin::run_plugin_filter(&w.app_handle(), plugin_name, filter, &body)
        .await
        .expect("Failed to run filter");
    Ok(filter_result.filtered)
}

#[tauri::command]
async fn cmd_import_data(
    w: WebviewWindow,
    file_path: &str,
    _workspace_id: &str,
) -> Result<WorkspaceExportResources, String> {
    let mut result: Option<ImportResult> = None;
    let plugins = vec![
        "importer-yaak",
        "importer-insomnia",
        "importer-postman",
        "importer-curl",
    ];
    let file = fs::read_to_string(file_path)
        .unwrap_or_else(|_| panic!("Unable to read file {}", file_path));
    let file_contents = file.as_str();
    for plugin_name in plugins {
        let v = plugin::run_plugin_import(&w.app_handle(), plugin_name, file_contents)
            .await
            .map_err(|e| e.to_string())?;
        if let Some(r) = v {
            info!("Imported data using {}", plugin_name);
            analytics::track_event(
                &w.app_handle(),
                AnalyticsResource::App,
                AnalyticsAction::Import,
                Some(json!({ "plugin": plugin_name })),
            )
            .await;
            result = Some(r);
            break;
        }
    }

    match result {
        None => Err("No import handlers found".to_string()),
        Some(r) => {
            let mut imported_resources = WorkspaceExportResources::default();
            let mut id_map: HashMap<String, String> = HashMap::new();

            let maybe_gen_id =
                |id: &str, model: ModelType, ids: &mut HashMap<String, String>| -> String {
                    if !id.starts_with("GENERATE_ID::") {
                        return id.to_string();
                    }

                    let unique_key = id.replace("GENERATE_ID", "");
                    if let Some(existing) = ids.get(unique_key.as_str()) {
                        existing.to_string()
                    } else {
                        let new_id = generate_model_id(model);
                        ids.insert(unique_key, new_id.clone());
                        new_id
                    }
                };

            let maybe_gen_id_opt = |id: Option<String>,
                                    model: ModelType,
                                    ids: &mut HashMap<String, String>|
             -> Option<String> {
                match id {
                    Some(id) => Some(maybe_gen_id(id.as_str(), model, ids)),
                    None => None,
                }
            };

            info!("Importing resources");
            for mut v in r.resources.workspaces {
                v.id = maybe_gen_id(v.id.as_str(), ModelType::TypeWorkspace, &mut id_map);
                let x = upsert_workspace(&w, v).await.map_err(|e| e.to_string())?;
                imported_resources.workspaces.push(x.clone());
                info!("Imported workspace: {}", x.name);
            }

            for mut v in r.resources.environments {
                v.id = maybe_gen_id(v.id.as_str(), ModelType::TypeEnvironment, &mut id_map);
                v.workspace_id = maybe_gen_id(
                    v.workspace_id.as_str(),
                    ModelType::TypeWorkspace,
                    &mut id_map,
                );
                let x = upsert_environment(&w, v).await.map_err(|e| e.to_string())?;
                imported_resources.environments.push(x.clone());
                info!("Imported environment: {}", x.name);
            }

            for mut v in r.resources.folders {
                v.id = maybe_gen_id(v.id.as_str(), ModelType::TypeFolder, &mut id_map);
                v.workspace_id = maybe_gen_id(
                    v.workspace_id.as_str(),
                    ModelType::TypeWorkspace,
                    &mut id_map,
                );
                v.folder_id = maybe_gen_id_opt(v.folder_id, ModelType::TypeFolder, &mut id_map);
                let x = upsert_folder(&w, v).await.map_err(|e| e.to_string())?;
                imported_resources.folders.push(x.clone());
                info!("Imported folder: {}", x.name);
            }

            for mut v in r.resources.http_requests {
                v.id = maybe_gen_id(v.id.as_str(), ModelType::TypeHttpRequest, &mut id_map);
                v.workspace_id = maybe_gen_id(
                    v.workspace_id.as_str(),
                    ModelType::TypeWorkspace,
                    &mut id_map,
                );
                v.folder_id = maybe_gen_id_opt(v.folder_id, ModelType::TypeFolder, &mut id_map);
                let x = upsert_http_request(&w, v)
                    .await
                    .map_err(|e| e.to_string())?;
                imported_resources.http_requests.push(x.clone());
                info!("Imported request: {}", x.name);
            }

            for mut v in r.resources.grpc_requests {
                v.id = maybe_gen_id(v.id.as_str(), ModelType::TypeGrpcRequest, &mut id_map);
                v.workspace_id = maybe_gen_id(
                    v.workspace_id.as_str(),
                    ModelType::TypeWorkspace,
                    &mut id_map,
                );
                v.folder_id = maybe_gen_id_opt(v.folder_id, ModelType::TypeFolder, &mut id_map);
                let x = upsert_grpc_request(&w, &v)
                    .await
                    .map_err(|e| e.to_string())?;
                imported_resources.grpc_requests.push(x.clone());
                info!("Imported request: {}", x.name);
            }

            Ok(imported_resources)
        }
    }
}

#[tauri::command]
async fn cmd_request_to_curl(
    app: AppHandle,
    request_id: &str,
    environment_id: Option<&str>,
) -> Result<String, String> {
    let request = get_http_request(&app, request_id)
        .await
        .map_err(|e| e.to_string())?;
    let environment = match environment_id {
        Some(id) => Some(get_environment(&app, id).await.map_err(|e| e.to_string())?),
        None => None,
    };
    let workspace = get_workspace(&app, &request.workspace_id)
        .await
        .map_err(|e| e.to_string())?;
    let rendered = render_request(&request, &workspace, environment.as_ref());
    Ok(run_plugin_export_curl(&app, &rendered)?)
}

#[tauri::command]
async fn cmd_curl_to_request(
    app: AppHandle,
    command: &str,
    workspace_id: &str,
) -> Result<HttpRequest, String> {
    let v = run_plugin_import(&app, "importer-curl", command)
        .await
        .map_err(|e| e.to_string());
    match v {
        Ok(Some(r)) => r
            .resources
            .http_requests
            .get(0)
            .ok_or("No curl command found".to_string())
            .map(|r| {
                let mut request = r.clone();
                request.workspace_id = workspace_id.into();
                request.id = "".to_string();
                request
            }),
        Ok(None) => Err("Did not find curl request".to_string()),
        Err(e) => Err(e),
    }
}

#[tauri::command]
async fn cmd_export_data(
    window: WebviewWindow,
    export_path: &str,
    workspace_ids: Vec<&str>,
) -> Result<(), String> {
    let export_data = get_workspace_export_resources(&window, workspace_ids).await;
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

    analytics::track_event(
        &window.app_handle(),
        AnalyticsResource::App,
        AnalyticsAction::Export,
        None,
    )
    .await;

    Ok(())
}

#[tauri::command]
async fn cmd_send_http_request(
    window: WebviewWindow,
    request_id: &str,
    environment_id: Option<&str>,
    cookie_jar_id: Option<&str>,
    download_dir: Option<&str>,
) -> Result<HttpResponse, String> {
    let request = get_http_request(&window, request_id)
        .await
        .expect("Failed to get request");

    let environment = match environment_id {
        Some(id) => match get_environment(&window, id).await {
            Ok(env) => Some(env),
            Err(e) => {
                warn!("Failed to find environment by id {id} {}", e);
                None
            }
        },
        None => None,
    };

    let cookie_jar = match cookie_jar_id {
        Some(id) => Some(
            get_cookie_jar(&window, id)
                .await
                .expect("Failed to get cookie jar"),
        ),
        None => None,
    };

    let response = create_http_response(
        &window,
        &request.id,
        0,
        0,
        "",
        0,
        None,
        None,
        None,
        vec![],
        None,
        None,
    )
    .await
    .expect("Failed to create response");

    let download_path = if let Some(p) = download_dir {
        Some(std::path::Path::new(p).to_path_buf())
    } else {
        None
    };

    let (cancel_tx, mut cancel_rx) = tokio::sync::watch::channel(false);
    window.listen_any(
        format!("cancel_http_response_{}", response.id),
        move |_event| {
            let _ = cancel_tx.send(true);
        },
    );

    send_http_request(
        &window,
        request.clone(),
        &response,
        environment,
        cookie_jar,
        download_path,
        &mut cancel_rx,
    )
    .await
}

async fn response_err(
    response: &HttpResponse,
    error: String,
    w: &WebviewWindow,
) -> Result<HttpResponse, String> {
    let mut response = response.clone();
    response.elapsed = -1;
    response.error = Some(error.clone());
    response = update_response_if_id(w, &response)
        .await
        .expect("Failed to update response");
    Ok(response)
}

#[tauri::command]
async fn cmd_track_event(
    window: WebviewWindow,
    resource: &str,
    action: &str,
    attributes: Option<Value>,
) -> Result<(), String> {
    match (
        AnalyticsResource::from_str(resource),
        AnalyticsAction::from_str(action),
    ) {
        (Ok(resource), Ok(action)) => {
            analytics::track_event(&window.app_handle(), resource, action, attributes).await;
        }
        (r, a) => {
            error!(
                "Invalid action/resource for track_event: {resource}.{action} = {:?}.{:?}",
                r, a
            );
            return Err("Invalid analytics event".to_string());
        }
    };
    Ok(())
}

#[tauri::command]
async fn cmd_set_update_mode(update_mode: &str, w: WebviewWindow) -> Result<KeyValue, String> {
    cmd_set_key_value("app", "update_mode", update_mode, w)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_key_value(
    namespace: &str,
    key: &str,
    w: WebviewWindow,
) -> Result<Option<KeyValue>, ()> {
    let result = get_key_value_raw(&w, namespace, key).await;
    Ok(result)
}

#[tauri::command]
async fn cmd_set_key_value(
    namespace: &str,
    key: &str,
    value: &str,
    w: WebviewWindow,
) -> Result<KeyValue, String> {
    let (key_value, _created) = set_key_value_raw(&w, namespace, key, value).await;
    Ok(key_value)
}

#[tauri::command]
async fn cmd_create_workspace(name: &str, w: WebviewWindow) -> Result<Workspace, String> {
    upsert_workspace(&w, Workspace::new(name.to_string()))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_cookie_jar(
    cookie_jar: CookieJar,
    w: WebviewWindow,
) -> Result<CookieJar, String> {
    upsert_cookie_jar(&w, &cookie_jar)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_cookie_jar(w: WebviewWindow, cookie_jar_id: &str) -> Result<CookieJar, String> {
    delete_cookie_jar(&w, cookie_jar_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_cookie_jar(
    workspace_id: &str,
    name: &str,
    w: WebviewWindow,
) -> Result<CookieJar, String> {
    upsert_cookie_jar(
        &w,
        &CookieJar {
            name: name.to_string(),
            workspace_id: workspace_id.to_string(),
            ..Default::default()
        },
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_environment(
    workspace_id: &str,
    name: &str,
    variables: Vec<EnvironmentVariable>,
    w: WebviewWindow,
) -> Result<Environment, String> {
    upsert_environment(
        &w,
        Environment {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            variables: Json(variables),
            ..Default::default()
        },
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_grpc_request(
    workspace_id: &str,
    name: &str,
    sort_priority: f64,
    folder_id: Option<&str>,
    w: WebviewWindow,
) -> Result<GrpcRequest, String> {
    upsert_grpc_request(
        &w,
        &GrpcRequest {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            folder_id: folder_id.map(|s| s.to_string()),
            sort_priority,
            ..Default::default()
        },
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_duplicate_grpc_request(id: &str, w: WebviewWindow) -> Result<GrpcRequest, String> {
    duplicate_grpc_request(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_http_request(
    request: HttpRequest,
    w: WebviewWindow,
) -> Result<HttpRequest, String> {
    upsert_http_request(&w, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_duplicate_http_request(id: &str, w: WebviewWindow) -> Result<HttpRequest, String> {
    duplicate_http_request(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_workspace(workspace: Workspace, w: WebviewWindow) -> Result<Workspace, String> {
    upsert_workspace(&w, workspace)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_environment(
    environment: Environment,
    w: WebviewWindow,
) -> Result<Environment, String> {
    upsert_environment(&w, environment)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_grpc_request(
    request: GrpcRequest,
    w: WebviewWindow,
) -> Result<GrpcRequest, String> {
    upsert_grpc_request(&w, &request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_http_request(
    request: HttpRequest,
    window: WebviewWindow,
) -> Result<HttpRequest, String> {
    upsert_http_request(&window, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_grpc_request(
    w: WebviewWindow,
    request_id: &str,
) -> Result<GrpcRequest, String> {
    delete_grpc_request(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_http_request(
    w: WebviewWindow,
    request_id: &str,
) -> Result<HttpRequest, String> {
    delete_http_request(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_folders(workspace_id: &str, w: WebviewWindow) -> Result<Vec<Folder>, String> {
    list_folders(&w, workspace_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_folder(
    workspace_id: &str,
    name: &str,
    sort_priority: f64,
    folder_id: Option<&str>,
    w: WebviewWindow,
) -> Result<Folder, String> {
    upsert_folder(
        &w,
        Folder {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            folder_id: folder_id.map(|s| s.to_string()),
            sort_priority,
            ..Default::default()
        },
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_folder(folder: Folder, w: WebviewWindow) -> Result<Folder, String> {
    upsert_folder(&w, folder).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_write_file_dev(pathname: &str, contents: &str) -> Result<(), String> {
    if !is_dev() {
        panic!("Cannot write arbitrary files when not in dev mode");
    }

    fs::write(pathname, contents).map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_folder(w: WebviewWindow, folder_id: &str) -> Result<Folder, String> {
    delete_folder(&w, folder_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_environment(
    w: WebviewWindow,
    environment_id: &str,
) -> Result<Environment, String> {
    delete_environment(&w, environment_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_grpc_connections(
    request_id: &str,
    w: WebviewWindow,
) -> Result<Vec<GrpcConnection>, String> {
    list_grpc_connections(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_grpc_events(
    connection_id: &str,
    w: WebviewWindow,
) -> Result<Vec<GrpcEvent>, String> {
    list_grpc_events(&w, connection_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_grpc_requests(
    workspace_id: &str,
    w: WebviewWindow,
) -> Result<Vec<GrpcRequest>, String> {
    let requests = list_grpc_requests(&w, workspace_id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(requests)
}

#[tauri::command]
async fn cmd_list_http_requests(
    workspace_id: &str,
    w: WebviewWindow,
) -> Result<Vec<HttpRequest>, String> {
    let requests = list_http_requests(&w, workspace_id)
        .await
        .expect("Failed to find requests");
    // .map_err(|e| e.to_string())
    Ok(requests)
}

#[tauri::command]
async fn cmd_list_environments(
    workspace_id: &str,
    w: WebviewWindow,
) -> Result<Vec<Environment>, String> {
    let environments = list_environments(&w, workspace_id)
        .await
        .expect("Failed to find environments");

    Ok(environments)
}

#[tauri::command]
async fn cmd_get_settings(w: WebviewWindow) -> Result<Settings, ()> {
    Ok(get_or_create_settings(&w).await)
}

#[tauri::command]
async fn cmd_update_settings(settings: Settings, w: WebviewWindow) -> Result<Settings, String> {
    update_settings(&w, settings)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_folder(id: &str, w: WebviewWindow) -> Result<Folder, String> {
    get_folder(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_grpc_request(id: &str, w: WebviewWindow) -> Result<GrpcRequest, String> {
    get_grpc_request(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_http_request(id: &str, w: WebviewWindow) -> Result<HttpRequest, String> {
    get_http_request(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_cookie_jar(id: &str, w: WebviewWindow) -> Result<CookieJar, String> {
    get_cookie_jar(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_cookie_jars(
    workspace_id: &str,
    w: WebviewWindow,
) -> Result<Vec<CookieJar>, String> {
    let cookie_jars = list_cookie_jars(&w, workspace_id)
        .await
        .expect("Failed to find cookie jars");

    if cookie_jars.is_empty() {
        let cookie_jar = upsert_cookie_jar(
            &w,
            &CookieJar {
                name: "Default".to_string(),
                workspace_id: workspace_id.to_string(),
                ..Default::default()
            },
        )
        .await
        .expect("Failed to create CookieJar");
        Ok(vec![cookie_jar])
    } else {
        Ok(cookie_jars)
    }
}

#[tauri::command]
async fn cmd_get_environment(id: &str, w: WebviewWindow) -> Result<Environment, String> {
    get_environment(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_workspace(id: &str, w: WebviewWindow) -> Result<Workspace, String> {
    get_workspace(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_http_responses(
    request_id: &str,
    limit: Option<i64>,
    w: WebviewWindow,
) -> Result<Vec<HttpResponse>, String> {
    list_responses(&w, request_id, limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_http_response(id: &str, w: WebviewWindow) -> Result<HttpResponse, String> {
    delete_http_response(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_grpc_connection(id: &str, w: WebviewWindow) -> Result<GrpcConnection, String> {
    delete_grpc_connection(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_all_grpc_connections(request_id: &str, w: WebviewWindow) -> Result<(), String> {
    delete_all_grpc_connections(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_all_http_responses(request_id: &str, w: WebviewWindow) -> Result<(), String> {
    delete_all_http_responses(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_workspaces(w: WebviewWindow) -> Result<Vec<Workspace>, String> {
    let workspaces = list_workspaces(&w)
        .await
        .expect("Failed to find workspaces");
    if workspaces.is_empty() {
        let workspace = upsert_workspace(
            &w,
            Workspace {
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
async fn cmd_new_window(app_handle: AppHandle, url: &str) -> Result<(), String> {
    create_window(&app_handle, url);
    Ok(())
}

#[tauri::command]
async fn cmd_new_nested_window(
    window: WebviewWindow,
    url: &str,
    label: &str,
    title: &str,
) -> Result<(), String> {
    create_nested_window(&window, label, url, title);
    Ok(())
}

#[tauri::command]
async fn cmd_delete_workspace(w: WebviewWindow, workspace_id: &str) -> Result<Workspace, String> {
    delete_workspace(&w, workspace_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_check_for_updates(
    app_handle: AppHandle,
    yaak_updater: State<'_, Mutex<YaakUpdater>>,
) -> Result<bool, String> {
    let update_mode = get_update_mode(&app_handle).await;
    yaak_updater
        .lock()
        .await
        .force_check(&app_handle, update_mode)
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init());

    #[cfg(target_os = "windows")]
    {
        builder = builder.plugin(tauri_plugin_windows_window::init());
    }

    #[cfg(target_os = "macos")]
    {
        builder = builder.plugin(tauri_plugin_mac_window::init());
    }

    #[cfg(target_os = "linux")]
    {
        builder = builder; // Don't complain about not being mut
    }

    builder
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .level_for("cookie_store", log::LevelFilter::Info)
                .level_for("h2", log::LevelFilter::Info)
                .level_for("hyper", log::LevelFilter::Info)
                .level_for("hyper_rustls", log::LevelFilter::Info)
                .level_for("reqwest", log::LevelFilter::Info)
                .level_for("sqlx", log::LevelFilter::Warn)
                .level_for("tao", log::LevelFilter::Info)
                .level_for("tokio_util", log::LevelFilter::Info)
                .level_for("tonic", log::LevelFilter::Info)
                .level_for("tower", log::LevelFilter::Info)
                .level_for("tracing", log::LevelFilter::Info)
                .with_colors(ColoredLevelConfig::default())
                .level(if is_dev() {
                    log::LevelFilter::Trace
                } else {
                    log::LevelFilter::Info
                })
                .build(),
        )
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().unwrap();
            let app_config_dir = app.path().app_config_dir().unwrap();
            info!(
                "App Config Dir: {}",
                app_config_dir.as_path().to_string_lossy(),
            );
            info!("App Data Dir: {}", app_data_dir.as_path().to_string_lossy());
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

            // Add updater
            let yaak_updater = YaakUpdater::new();
            app.manage(Mutex::new(yaak_updater));

            // Add notifier
            let yaak_notifier = YaakNotifier::new();
            app.manage(Mutex::new(yaak_notifier));

            // Add GRPC manager
            let grpc_handle = GrpcHandle::new(&app.app_handle());
            app.manage(Mutex::new(grpc_handle));

            // Add DB handle
            tauri::async_runtime::block_on(async move {
                let opts = SqliteConnectOptions::from_str(p.to_str().unwrap()).unwrap();
                let pool = SqlitePool::connect_with(opts)
                    .await
                    .expect("Failed to connect to database");
                let m = Mutex::new(pool.clone());
                migrate_db(app.handle(), &m)
                    .await
                    .expect("Failed to migrate database");
                app.manage(m);
                let h = app.handle();
                let _ = cancel_pending_responses(h).await;
                let _ = cancel_pending_grpc_connections(h).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            cmd_check_for_updates,
            cmd_create_cookie_jar,
            cmd_create_environment,
            cmd_create_folder,
            cmd_create_grpc_request,
            cmd_create_http_request,
            cmd_create_workspace,
            cmd_curl_to_request,
            cmd_delete_all_grpc_connections,
            cmd_delete_all_http_responses,
            cmd_delete_cookie_jar,
            cmd_delete_environment,
            cmd_delete_folder,
            cmd_delete_grpc_connection,
            cmd_delete_grpc_request,
            cmd_delete_http_request,
            cmd_delete_http_response,
            cmd_delete_workspace,
            cmd_duplicate_grpc_request,
            cmd_duplicate_http_request,
            cmd_export_data,
            cmd_filter_response,
            cmd_get_cookie_jar,
            cmd_get_environment,
            cmd_get_folder,
            cmd_get_grpc_request,
            cmd_get_http_request,
            cmd_get_key_value,
            cmd_get_settings,
            cmd_get_workspace,
            cmd_grpc_go,
            cmd_grpc_reflect,
            cmd_import_data,
            cmd_list_cookie_jars,
            cmd_list_environments,
            cmd_list_folders,
            cmd_list_grpc_connections,
            cmd_list_grpc_events,
            cmd_list_grpc_requests,
            cmd_list_http_requests,
            cmd_list_http_responses,
            cmd_list_workspaces,
            cmd_metadata,
            cmd_new_nested_window,
            cmd_new_window,
            cmd_request_to_curl,
            cmd_dismiss_notification,
            cmd_send_ephemeral_request,
            cmd_send_http_request,
            cmd_set_key_value,
            cmd_set_update_mode,
            cmd_track_event,
            cmd_update_cookie_jar,
            cmd_update_environment,
            cmd_update_folder,
            cmd_update_grpc_request,
            cmd_update_http_request,
            cmd_update_settings,
            cmd_update_workspace,
            cmd_write_file_dev,
        ])
        .register_uri_scheme_protocol("yaak", |_app, _req| {
            debug!("Testing yaak protocol");
            tauri::http::Response::builder()
                .body("Success".as_bytes().to_vec())
                .unwrap()
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            match event {
                RunEvent::Ready => {
                    create_window(app_handle, "/");
                    let h = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        let info = analytics::track_launch_event(&h).await;
                        debug!("Launched Yaak {:?}", info);
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
                        let update_mode = get_update_mode(&h).await;
                        _ = val.lock().await.check(&h, update_mode).await;
                    });

                    let h = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        tokio::time::sleep(Duration::from_millis(4000)).await;
                        let val: State<'_, Mutex<YaakNotifier>> = h.state();
                        let mut n = val.lock().await;
                        if let Err(e) = n.check(&h).await {
                            warn!("Failed to check for notifications {}", e)
                        }
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

fn create_nested_window(
    window: &WebviewWindow,
    label: &str,
    url: &str,
    title: &str,
) -> WebviewWindow {
    info!("Create new nested window label={label}");
    let mut win_builder = tauri::WebviewWindowBuilder::new(
        window,
        format!("nested_{}_{}", window.label(), label),
        WebviewUrl::App(url.into()),
    )
    .resizable(true)
    .fullscreen(false)
    .disable_drag_drop_handler() // Required for frontend Dnd on windows
    .title(title)
    .parent(&window)
    .unwrap()
    .inner_size(DEFAULT_WINDOW_WIDTH * 0.5, DEFAULT_WINDOW_HEIGHT * 0.75);

    // Add macOS-only things
    #[cfg(target_os = "macos")]
    {
        win_builder = win_builder
            .hidden_title(true)
            .title_bar_style(TitleBarStyle::Overlay);
    }

    // Add non-MacOS things
    #[cfg(not(target_os = "macos"))]
    {
        win_builder = win_builder.decorations(false);
    }

    let win = win_builder.build().expect("failed to build window");

    win
}

fn create_window(handle: &AppHandle, url: &str) -> WebviewWindow {
    #[allow(unused_variables)]
    let menu = app_menu(handle).unwrap();

    // This causes the window to not be clickable (in AppImage), so disable on Linux
    #[cfg(not(target_os = "linux"))]
    handle.set_menu(menu).expect("Failed to set app menu");

    let window_num = handle.webview_windows().len();
    let label = format!("main_{}", window_num);
    info!("Create new window label={label}");
    let mut win_builder =
        tauri::WebviewWindowBuilder::new(handle, label, WebviewUrl::App(url.into()))
            .resizable(true)
            .fullscreen(false)
            .disable_drag_drop_handler() // Required for frontend Dnd on windows
            .inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)
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
            .hidden_title(true)
            .title_bar_style(TitleBarStyle::Overlay);
    }

    // Add non-MacOS things
    #[cfg(not(target_os = "macos"))]
    {
        // Doesn't seem to work from Rust, here, so we do it in main.tsx
        win_builder = win_builder.decorations(false);
    }

    let win = win_builder.build().expect("failed to build window");

    let webview_window = win.clone();
    win.on_menu_event(move |w, event| {
        if !w.is_focused().unwrap() {
            return;
        }

        match event.id().0.as_str() {
            "quit" => exit(0),
            "close" => w.close().unwrap(),
            "zoom_reset" => w.emit("zoom_reset", true).unwrap(),
            "zoom_in" => w.emit("zoom_in", true).unwrap(),
            "zoom_out" => w.emit("zoom_out", true).unwrap(),
            "settings" => w.emit("settings", true).unwrap(),
            "open_feedback" => {
                _ = webview_window
                    .app_handle()
                    .shell()
                    .open("https://yaak.canny.io", None)
            }

            // Commands for development
            "dev.reset_size" => webview_window
                .set_size(LogicalSize::new(
                    DEFAULT_WINDOW_WIDTH,
                    DEFAULT_WINDOW_HEIGHT,
                ))
                .unwrap(),
            "dev.refresh" => webview_window.eval("location.reload()").unwrap(),
            "dev.toggle_devtools" => {
                if webview_window.is_devtools_open() {
                    webview_window.close_devtools();
                } else {
                    webview_window.open_devtools();
                }
            }
            _ => {}
        }
    });

    win
}

async fn get_update_mode(h: &AppHandle) -> UpdateMode {
    let settings = get_or_create_settings(h).await;
    UpdateMode::new(settings.update_channel.as_str())
}

fn safe_uri(endpoint: &str) -> Result<Uri, InvalidUri> {
    let uri = if endpoint.starts_with("http://") || endpoint.starts_with("https://") {
        Uri::from_str(endpoint)?
    } else {
        Uri::from_str(&format!("http://{}", endpoint))?
    };
    Ok(uri)
}
