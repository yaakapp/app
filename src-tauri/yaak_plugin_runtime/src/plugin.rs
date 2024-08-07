use std::net::SocketAddr;
use std::path::PathBuf;
use std::process::exit;
use std::time::Duration;

use log::info;
use tauri::path::BaseDirectory;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime, State};
use tokio::fs::read_dir;
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream;
use tonic::transport::Server;

use crate::error::Result;
use crate::events::{InternalEvent, InternalEventPayload};
use crate::manager::PluginManager;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntimeServer;
use crate::server::PluginRuntimeGrpcServer;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("yaak_plugin_runtime")
        .setup(|app, _| {
            let plugins_dir = app
                .path()
                .resolve("plugins", BaseDirectory::Resource)
                .expect("failed to resolve plugin directory resource");
            let (tx, mut rx) = mpsc::channel(128);
            let (send, recv) = multiqueue::broadcast_queue::<InternalEvent>(128);

            // Tie together mpsc channel and "mpmc" multi-queue
            tauri::async_runtime::spawn(async move {
                while let Some(e) = rx.recv().await {
                    send.try_send(e).unwrap()
                }
            });

            tauri::async_runtime::block_on(async move {
                let plugin_dirs = read_plugins_dir(&plugins_dir)
                    .await
                    .expect("Failed to read plugins dir");
                let (server, addr) = start_server(plugin_dirs, tx)
                    .await
                    .expect("Failed to start plugin runtime server");
                let manager = PluginManager::new(&app, server, addr, recv).await;
                let manager_state = Mutex::new(manager);
                app.manage(manager_state);
                Ok(())
            })
        })
        .on_event(|app, e| match e {
            // TODO: Also exit when app is force-quit (eg. cmd+r in IntelliJ runner)
            RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
                tauri::async_runtime::block_on(async move {
                    info!("Exiting plugin runtime due to app exit");
                    let manager: State<Mutex<PluginManager>> = app.state();
                    manager.lock().await.cleanup().await;
                    exit(0);
                });
            }
            _ => {}
        })
        .build()
}

pub async fn start_server(
    plugin_dirs: Vec<String>,
    events_tx: mpsc::Sender<InternalEvent>,
) -> Result<(PluginRuntimeGrpcServer, SocketAddr)> {
    println!("Starting plugin server with {plugin_dirs:?}");
    let (to_server_tx, mut to_server_rx) = mpsc::channel(128);
    let server = PluginRuntimeGrpcServer::new(to_server_tx, plugin_dirs);

    let svc = PluginRuntimeServer::new(server.clone());
    let listen_addr = match option_env!("PORT") {
        None => "localhost:0".to_string(),
        Some(port) => format!("localhost:{port}"),
    };

    {
        let server = server.clone();
        tokio::spawn(async move {
            while let Some(event) = to_server_rx.recv().await {
                match event.clone() {
                    InternalEvent {
                        payload: InternalEventPayload::BootResponse(resp),
                        plugin_ref_id,
                        ..
                    } => {
                        server.boot_plugin(plugin_ref_id.as_str(), &resp).await;
                    }
                    event => {
                        events_tx
                            .send(event)
                            .await
                            .expect("Sending event to channel failed");
                    }
                };
            }
        });
    };

    let listener = TcpListener::bind(listen_addr).await?;
    let addr = listener.local_addr()?;
    println!("Starting gRPC plugin server on {addr}");
    tokio::spawn(async move {
        Server::builder()
            .timeout(Duration::from_secs(10))
            .add_service(svc)
            .serve_with_incoming(tokio_stream::wrappers::TcpListenerStream::new(listener))
            .await.expect("grpc plugin runtime server failed to start");
    });

    Ok((server, addr))
}

async fn read_plugins_dir(dir: &PathBuf) -> Result<Vec<String>> {
    let mut result = read_dir(dir).await?;
    let mut dirs: Vec<String> = vec![];
    while let Ok(Some(entry)) = result.next_entry().await {
        if entry.path().is_dir() {
            dirs.push(entry.path().to_string_lossy().to_string())
        }
    }
    Ok(dirs)
}
