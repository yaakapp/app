use crate::error::Result;
use crate::events::{PluginEvent, PluginEventPayload, PluginPingResponse};
use crate::manager::PluginManager;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntimeServer;
use crate::server::{GrpcServer, PluginHandle};
use log::info;
use std::collections::HashMap;
use std::process::exit;
use std::sync::Arc;
use std::time::Duration;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime, State};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream;
use tonic::transport::Server;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("yaak_plugin_runtime")
        .setup(|app, _| {
            tauri::async_runtime::block_on(async move {
                let manager = PluginManager::new(&app).await;
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

pub async fn start_server() -> Result<()> {
    let (to_server_tx, mut to_server_rx) = mpsc::channel(128);
    let server = GrpcServer::new(to_server_tx);

    let svc = PluginRuntimeServer::new(server.clone());
    let listen_addr = match option_env!("PORT") {
        None => "127.0.0.1:0".to_string(),
        Some(port) => format!("127.0.0.1:{port}"),
    };

    tokio::spawn(async move {
        while let Some((event, mut plugin)) = to_server_rx.recv().await {
            match event.clone().payload {
                PluginEventPayload::PingRequest(req) => {
                    println!("Received ping! {req:?}");
                    server
                        .callback(
                            event,
                            PluginEventPayload::PingResponse(PluginPingResponse {
                                message: format!("Echo: {}", req.message),
                            }),
                        )
                        .await
                        .unwrap();
                }
                PluginEventPayload::BootResponse(resp) => {
                    println!("Plugin Booted {:?}", resp);
                    plugin.boot(resp);
                }
                _ => {
                    println!("Received unknown event {event:?}")
                }
            };
        }
    });

    let listener = TcpListener::bind(listen_addr).await?;
    let addr = listener.local_addr().unwrap();
    println!("Starting gRPC plugin server on {addr}");
    Server::builder()
        .timeout(Duration::from_secs(10))
        .add_service(svc)
        .serve_with_incoming(tokio_stream::wrappers::TcpListenerStream::new(listener))
        .await?;

    Ok(())
}
