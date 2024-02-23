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
use std::fs::{create_dir_all, read_to_string, File};
use std::path::PathBuf;
use std::process::exit;
use std::str::FromStr;

use ::http::uri::InvalidUri;
use ::http::Uri;
use base64::Engine;
use fern::colors::ColoredLevelConfig;
use log::{debug, error, info, warn};
use rand::random;
use serde_json::{json, Value};
use sqlx::migrate::Migrator;
use sqlx::types::Json;
use sqlx::{Pool, Sqlite, SqlitePool};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri::{AppHandle, RunEvent, State, Window, WindowUrl};
use tauri::{Manager, WindowEvent};
use tauri_plugin_log::{fern, LogTarget};
use tauri_plugin_window_state::{StateFlags, WindowExt};
use tokio::sync::Mutex;
use tokio::time::sleep;
use window_shadows::set_shadow;

use ::grpc::manager::{DynamicMessage, GrpcHandle};
use ::grpc::{deserialize_message, serialize_message, Code, ServiceDefinition};
use window_ext::TrafficLightWindowExt;

use crate::analytics::{AnalyticsAction, AnalyticsResource};
use crate::grpc::metadata_to_map;
use crate::http::send_http_request;
use crate::models::{
    cancel_pending_grpc_connections, cancel_pending_responses, create_http_response,
    delete_all_grpc_connections, delete_all_http_responses, delete_cookie_jar, delete_environment,
    delete_folder, delete_grpc_connection, delete_grpc_request, delete_http_request,
    delete_http_response, delete_workspace, duplicate_grpc_request, duplicate_http_request,
    get_cookie_jar, get_environment, get_folder, get_grpc_connection, get_grpc_request,
    get_http_request, get_http_response, get_key_value_raw, get_or_create_settings, get_workspace,
    get_workspace_export_resources, list_cookie_jars, list_environments, list_folders,
    list_grpc_connections, list_grpc_events, list_grpc_requests, list_requests, list_responses,
    list_workspaces, set_key_value_raw, update_response_if_id, update_settings, upsert_cookie_jar,
    upsert_environment, upsert_folder, upsert_grpc_connection, upsert_grpc_event,
    upsert_grpc_request, upsert_http_request, upsert_workspace, CookieJar, Environment,
    EnvironmentVariable, Folder, GrpcConnection, GrpcEvent, GrpcEventType, GrpcRequest,
    HttpRequest, HttpResponse, KeyValue, Settings, Workspace,
};
use crate::plugin::{ImportResources, ImportResult};
use crate::updates::{update_mode_from_str, UpdateMode, YaakUpdater};

mod analytics;
mod grpc;
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

async fn migrate_db(app_handle: AppHandle, db: &Mutex<Pool<Sqlite>>) -> Result<(), String> {
    let pool = &*db.lock().await;
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
async fn cmd_grpc_reflect(
    request_id: &str,
    window: Window,
    grpc_handle: State<'_, Mutex<GrpcHandle>>,
) -> Result<Vec<ServiceDefinition>, String> {
    let req = get_grpc_request(&window, request_id)
        .await
        .map_err(|e| e.to_string())?;
    let uri = safe_uri(&req.url).map_err(|e| e.to_string())?;
    if req.proto_files.0.len() > 0 {
        grpc_handle
            .lock()
            .await
            .services_from_files(
                &req.id,
                &uri,
                req.proto_files
                    .0
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
    w: Window,
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
            req.proto_files
                .0
                .iter()
                .map(|p| PathBuf::from_str(p).unwrap())
                .collect(),
        )
        .await?;

    let method_desc = connection
        .method(&service, &method)
        .expect("Service not found");

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

            match serde_json::from_str::<IncomingMsg>(ev.payload().unwrap()) {
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
    let event_handler = w.listen_global(format!("grpc_client_msg_{}", conn.id).as_str(), cb);

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
                        &GrpcEvent {
                            content: "Failed to connect".to_string(),
                            event_type: GrpcEventType::ConnectionEnd,
                            error: Some(e.to_string()),
                            status: Some(Code::Unknown as i64),
                            ..base_event.clone()
                        },
                    )
                    .await
                    .unwrap();
                }
                None => {
                    // Server streaming doesn't return initial message
                }
            }

            let mut stream = match maybe_stream {
                Some(Ok(Ok(stream))) => {
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
                Some(Ok(Err(e))) => {
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            error: Some(e.message().to_string()),
                            status: Some(e.code() as i64),
                            content: e.code().description().to_string(),
                            event_type: GrpcEventType::ConnectionEnd,
                            ..base_event.clone()
                        },
                    )
                    .await
                    .unwrap();
                    return;
                }
                Some(Err(e)) => {
                    upsert_grpc_event(
                        &w,
                        &GrpcEvent {
                            error: Some(e),
                            status: Some(Code::Unknown as i64),
                            content: "Unknown error".to_string(),
                            event_type: GrpcEventType::ConnectionEnd,
                            ..base_event.clone()
                        },
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
    window: Window,
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

    // let cookie_jar_id2 = cookie_jar_id.unwrap_or("").to_string();
    send_http_request(&window, request, &response, environment, cookie_jar, None).await
}

#[tauri::command]
async fn cmd_filter_response(w: Window, response_id: &str, filter: &str) -> Result<String, String> {
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
async fn cmd_import_data(w: Window, file_paths: Vec<&str>) -> Result<ImportResources, String> {
    let mut result: Option<ImportResult> = None;
    let plugins = vec!["importer-yaak", "importer-insomnia", "importer-postman"];
    for plugin_name in plugins {
        if let Some(r) =
            plugin::run_plugin_import(&w.app_handle(), plugin_name, file_paths.first().unwrap())
                .await
        {
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
        None => Err("No importers found for the chosen file".to_string()),
        Some(r) => {
            let mut imported_resources = ImportResources::default();

            info!("Importing resources");
            for v in r.resources.workspaces {
                let x = upsert_workspace(&w, v)
                    .await
                    .expect("Failed to create workspace");
                imported_resources.workspaces.push(x.clone());
                info!("Imported workspace: {}", x.name);
            }

            for v in r.resources.environments {
                let x = upsert_environment(&w, v)
                    .await
                    .expect("Failed to create environment");
                imported_resources.environments.push(x.clone());
                info!("Imported environment: {}", x.name);
            }

            for v in r.resources.folders {
                let x = upsert_folder(&w, v).await.expect("Failed to create folder");
                imported_resources.folders.push(x.clone());
                info!("Imported folder: {}", x.name);
            }

            for v in r.resources.requests {
                let x = upsert_http_request(&w, v)
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
async fn cmd_export_data(
    app_handle: AppHandle,
    export_path: &str,
    workspace_id: &str,
) -> Result<(), String> {
    let export_data = get_workspace_export_resources(&app_handle, workspace_id).await;
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
        &app_handle,
        AnalyticsResource::App,
        AnalyticsAction::Export,
        None,
    )
    .await;

    Ok(())
}

#[tauri::command]
async fn cmd_send_http_request(
    w: Window,
    request_id: &str,
    environment_id: Option<&str>,
    cookie_jar_id: Option<&str>,
    download_dir: Option<&str>,
) -> Result<HttpResponse, String> {
    let request = get_http_request(&w, request_id)
        .await
        .expect("Failed to get request");

    let environment = match environment_id {
        Some(id) => Some(
            get_environment(&w, id)
                .await
                .expect("Failed to get environment"),
        ),
        None => None,
    };

    let cookie_jar = match cookie_jar_id {
        Some(id) => Some(
            get_cookie_jar(&w, id)
                .await
                .expect("Failed to get cookie jar"),
        ),
        None => None,
    };

    let response = create_http_response(
        &w,
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

    send_http_request(
        &w,
        request.clone(),
        &response,
        environment,
        cookie_jar,
        download_path,
    )
    .await
}

async fn response_err(
    response: &HttpResponse,
    error: String,
    w: &Window,
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
    window: Window,
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
async fn cmd_set_update_mode(update_mode: &str, w: Window) -> Result<KeyValue, String> {
    cmd_set_key_value("app", "update_mode", update_mode, w)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_key_value(namespace: &str, key: &str, w: Window) -> Result<Option<KeyValue>, ()> {
    let result = get_key_value_raw(&w, namespace, key).await;
    Ok(result)
}

#[tauri::command]
async fn cmd_set_key_value(
    namespace: &str,
    key: &str,
    value: &str,
    w: Window,
) -> Result<KeyValue, String> {
    let (key_value, _created) = set_key_value_raw(&w, namespace, key, value).await;
    Ok(key_value)
}

#[tauri::command]
async fn cmd_create_workspace(name: &str, w: Window) -> Result<Workspace, String> {
    upsert_workspace(&w, Workspace::new(name.to_string()))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_cookie_jar(cookie_jar: CookieJar, w: Window) -> Result<CookieJar, String> {
    upsert_cookie_jar(&w, &cookie_jar)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_cookie_jar(w: Window, cookie_jar_id: &str) -> Result<CookieJar, String> {
    delete_cookie_jar(&w, cookie_jar_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_cookie_jar(
    workspace_id: &str,
    name: &str,
    w: Window,
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
    w: Window,
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
    w: Window,
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
async fn cmd_duplicate_grpc_request(id: &str, w: Window) -> Result<GrpcRequest, String> {
    duplicate_grpc_request(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_create_http_request(
    workspace_id: &str,
    name: &str,
    sort_priority: f64,
    folder_id: Option<&str>,
    method: Option<&str>,
    body_type: Option<&str>,
    w: Window,
) -> Result<HttpRequest, String> {
    upsert_http_request(
        &w,
        HttpRequest {
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            folder_id: folder_id.map(|s| s.to_string()),
            body_type: body_type.map(|s| s.to_string()),
            method: method.map(|s| s.to_string()).unwrap_or("GET".to_string()),
            sort_priority,
            ..Default::default()
        },
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_duplicate_http_request(id: &str, w: Window) -> Result<HttpRequest, String> {
    duplicate_http_request(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_workspace(workspace: Workspace, w: Window) -> Result<Workspace, String> {
    upsert_workspace(&w, workspace)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_environment(
    environment: Environment,
    w: Window,
) -> Result<Environment, String> {
    upsert_environment(&w, environment)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_grpc_request(request: GrpcRequest, w: Window) -> Result<GrpcRequest, String> {
    upsert_grpc_request(&w, &request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_update_http_request(
    request: HttpRequest,
    window: Window,
) -> Result<HttpRequest, String> {
    upsert_http_request(&window, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_grpc_request(w: Window, request_id: &str) -> Result<GrpcRequest, String> {
    delete_grpc_request(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_http_request(w: Window, request_id: &str) -> Result<HttpRequest, String> {
    delete_http_request(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_folders(workspace_id: &str, w: Window) -> Result<Vec<Folder>, String> {
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
    w: Window,
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
async fn cmd_update_folder(folder: Folder, w: Window) -> Result<Folder, String> {
    upsert_folder(&w, folder).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_folder(w: Window, folder_id: &str) -> Result<Folder, String> {
    delete_folder(&w, folder_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_environment(w: Window, environment_id: &str) -> Result<Environment, String> {
    delete_environment(&w, environment_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_grpc_connections(
    request_id: &str,
    w: Window,
) -> Result<Vec<GrpcConnection>, String> {
    list_grpc_connections(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_grpc_events(connection_id: &str, w: Window) -> Result<Vec<GrpcEvent>, String> {
    list_grpc_events(&w, connection_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_grpc_requests(workspace_id: &str, w: Window) -> Result<Vec<GrpcRequest>, String> {
    let requests = list_grpc_requests(&w, workspace_id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(requests)
}

#[tauri::command]
async fn cmd_list_http_requests(workspace_id: &str, w: Window) -> Result<Vec<HttpRequest>, String> {
    let requests = list_requests(&w, workspace_id)
        .await
        .expect("Failed to find requests");
    // .map_err(|e| e.to_string())
    Ok(requests)
}

#[tauri::command]
async fn cmd_list_environments(workspace_id: &str, w: Window) -> Result<Vec<Environment>, String> {
    let environments = list_environments(&w, workspace_id)
        .await
        .expect("Failed to find environments");

    Ok(environments)
}

#[tauri::command]
async fn cmd_get_settings(w: Window) -> Result<Settings, ()> {
    Ok(get_or_create_settings(&w).await)
}

#[tauri::command]
async fn cmd_update_settings(settings: Settings, w: Window) -> Result<Settings, String> {
    update_settings(&w, settings)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_folder(id: &str, w: Window) -> Result<Folder, String> {
    get_folder(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_grpc_request(id: &str, w: Window) -> Result<GrpcRequest, String> {
    get_grpc_request(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_http_request(id: &str, w: Window) -> Result<HttpRequest, String> {
    get_http_request(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_cookie_jar(id: &str, w: Window) -> Result<CookieJar, String> {
    get_cookie_jar(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_cookie_jars(workspace_id: &str, w: Window) -> Result<Vec<CookieJar>, String> {
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
async fn cmd_get_environment(id: &str, w: Window) -> Result<Environment, String> {
    get_environment(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_get_workspace(id: &str, w: Window) -> Result<Workspace, String> {
    get_workspace(&w, id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_http_responses(
    request_id: &str,
    limit: Option<i64>,
    w: Window,
) -> Result<Vec<HttpResponse>, String> {
    list_responses(&w, request_id, limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_http_response(id: &str, w: Window) -> Result<HttpResponse, String> {
    delete_http_response(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_grpc_connection(id: &str, w: Window) -> Result<GrpcConnection, String> {
    delete_grpc_connection(&w, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_all_grpc_connections(request_id: &str, w: Window) -> Result<(), String> {
    delete_all_grpc_connections(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_delete_all_http_responses(request_id: &str, w: Window) -> Result<(), String> {
    delete_all_http_responses(&w, request_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn cmd_list_workspaces(w: Window) -> Result<Vec<Workspace>, String> {
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
async fn cmd_new_window(window: Window, url: &str) -> Result<(), String> {
    create_window(&window.app_handle(), Some(url));
    Ok(())
}

#[tauri::command]
async fn cmd_delete_workspace(w: Window, workspace_id: &str) -> Result<Workspace, String> {
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
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
                .level(log::LevelFilter::Trace)
                .build(),
        )
        .setup(|app| {
            let app_data_dir = app.path_resolver().app_data_dir().unwrap();
            let app_config_dir = app.path_resolver().app_config_dir().unwrap();
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

            // Add GRPC manager
            let grpc_handle = GrpcHandle::default();
            app.manage(Mutex::new(grpc_handle));

            // Add DB handle
            tauri::async_runtime::block_on(async move {
                let pool = SqlitePool::connect(p.to_str().unwrap())
                    .await
                    .expect("Failed to connect to database");
                let m = Mutex::new(pool.clone());
                migrate_db(app.handle(), &m)
                    .await
                    .expect("Failed to migrate database");
                app.manage(m);
                let h = app.handle();
                let _ = cancel_pending_responses(&h).await;
                let _ = cancel_pending_grpc_connections(&h).await;
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
            cmd_delete_all_http_responses,
            cmd_delete_all_grpc_connections,
            cmd_delete_cookie_jar,
            cmd_delete_environment,
            cmd_delete_folder,
            cmd_delete_grpc_request,
            cmd_delete_grpc_connection,
            cmd_delete_http_request,
            cmd_delete_http_response,
            cmd_delete_workspace,
            cmd_duplicate_http_request,
            cmd_duplicate_grpc_request,
            cmd_export_data,
            cmd_filter_response,
            cmd_get_cookie_jar,
            cmd_get_environment,
            cmd_get_folder,
            cmd_get_key_value,
            cmd_get_http_request,
            cmd_get_grpc_request,
            cmd_get_settings,
            cmd_get_workspace,
            cmd_grpc_go,
            cmd_grpc_reflect,
            cmd_import_data,
            cmd_list_cookie_jars,
            cmd_list_environments,
            cmd_list_folders,
            cmd_list_http_requests,
            cmd_list_grpc_requests,
            cmd_list_grpc_connections,
            cmd_list_grpc_events,
            cmd_list_http_responses,
            cmd_list_workspaces,
            cmd_new_window,
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
                        let update_mode = get_update_mode(&h).await;
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

fn create_window(handle: &AppHandle, url: Option<&str>) -> Window {
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
    .disable_file_drop_handler() // Required for frontend Dnd on windows
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

async fn get_update_mode(h: &AppHandle) -> UpdateMode {
    let settings = get_or_create_settings(h).await;
    update_mode_from_str(settings.update_channel.as_str())
}

fn safe_uri(endpoint: &str) -> Result<Uri, InvalidUri> {
    let uri = if endpoint.starts_with("http://") || endpoint.starts_with("https://") {
        Uri::from_str(endpoint)?
    } else {
        Uri::from_str(&format!("http://{}", endpoint))?
    };
    Ok(uri)
}
