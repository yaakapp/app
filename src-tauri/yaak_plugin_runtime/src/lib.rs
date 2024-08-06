extern crate core;

use std::collections::HashMap;
use std::process::exit;
use std::sync::Arc;
use std::time::Duration;

use log::info;
use serde_json::Value;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime, State};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tonic::codegen::tokio_stream;
use tonic::transport::Server;

use crate::manager::PluginManager;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntimeServer;
use crate::server::plugin_runtime::PluginEvent;
use crate::server::GrpcServer;

mod events;
pub mod manager;
mod nodejs;
mod server;

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

pub async fn start_server() -> Result<(), Box<dyn std::error::Error>> {
    let (to_server_tx, mut to_server_rx) = mpsc::channel(128);
    let mut server = GrpcServer {
        plugins: Arc::new(Mutex::new(HashMap::new())),
        tx: Arc::new(Mutex::new(to_server_tx.clone())),
    };

    let svc = PluginRuntimeServer::new(server.clone());
    let listen_addr = match option_env!("PORT") {
        None => "127.0.0.1:0".to_string(),
        Some(port) => format!("127.0.0.1:{port}"),
    };

    server.foo().await;

    tokio::spawn(async move {
        while let Some(Ok(event)) = to_server_rx.recv().await {
            match event.name.as_str() {
                "ping" => {
                    println!("Received ping! {event:?}");
                    to_server_tx
                        .send(Ok(PluginEvent {
                            name: "pong".to_string(),
                            reply_id: "".to_string(),
                            payload: "{}".to_string(),
                        }))
                        .await
                        .unwrap();
                }
                "plugin.boot.response" => {
                    let p: Value = serde_json::from_str(event.payload.as_str()).unwrap();
                    println!("Plugin Booted {} {}", event.name, p);
                    println!("Plugin Booted {} {}", event.name, p);
                    // plugins.push(PluginHandle {
                    //     name: p.get("name").unwrap().to_string(),
                    //     capabilities: p
                    //         .get("capabilities")
                    //         .unwrap()
                    //         .as_array()
                    //         .unwrap()
                    //         .to_owned()
                    //         .iter()
                    //         .map(|v| v.to_string())
                    //         .collect::<Vec<String>>(),
                    // });
                }
                _ => {
                    println!("Received unknown event {event:?}")
                }
            };
        }
    });

    let listener = TcpListener::bind(listen_addr).await.unwrap();
    let addr = listener.local_addr().unwrap();
    println!("Starting gRPC plugin server on {addr}");
    Server::builder()
        .timeout(Duration::from_secs(10))
        .add_service(svc)
        .serve_with_incoming(tokio_stream::wrappers::TcpListenerStream::new(listener))
        .await
        .unwrap();

    Ok(())
}
