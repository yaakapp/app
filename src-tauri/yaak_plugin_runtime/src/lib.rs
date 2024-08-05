extern crate core;

use crate::manager::PluginManager;
use log::info;
use std::process::exit;
use std::time::Duration;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime, State};
use tokio::net::TcpListener;
use tokio::sync::Mutex;
use tonic::codegen::tokio_stream;
use tonic::transport::Server;
use crate::server::GrpcServer;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntimeServer;

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
    let server = GrpcServer {};
    let svc = PluginRuntimeServer::new(server);
    let listen_addr = match option_env!("PORT") {
        None => "127.0.0.1:0".to_string(),
        Some(port) => format!("127.0.0.1:{port}"),
    };

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
