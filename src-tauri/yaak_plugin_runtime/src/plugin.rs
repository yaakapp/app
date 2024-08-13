use crate::error::Result;
use crate::events::{InternalEvent, InternalEventPayload};
use crate::manager::PluginManager;
use crate::server::plugin_runtime::plugin_runtime_server::PluginRuntimeServer;
use crate::server::PluginRuntimeGrpcServer;
use log::info;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::process::exit;
use std::time::Duration;
use tauri::path::BaseDirectory;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime, State};
use tokio::fs::read_dir;
use tokio::net::TcpListener;
use tokio::sync::Mutex;
use tonic::codegen::tokio_stream;
use tonic::transport::Server;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("yaak_plugin_runtime")
        .setup(|app, _| {
            let plugins_dir = app
                .path()
                .resolve("plugins", BaseDirectory::Resource)
                .expect("failed to resolve plugin directory resource");

            tauri::async_runtime::block_on(async move {
                let plugin_dirs = read_plugins_dir(&plugins_dir)
                    .await
                    .expect("Failed to read plugins dir");
                let manager = PluginManager::new(&app, plugin_dirs).await;
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
) -> Result<(PluginRuntimeGrpcServer, SocketAddr)> {
    println!("Starting plugin server with {plugin_dirs:?}");
    let server = PluginRuntimeGrpcServer::new(plugin_dirs);

    let svc = PluginRuntimeServer::new(server.clone());
    let listen_addr = match option_env!("PORT") {
        None => "localhost:0".to_string(),
        Some(port) => format!("localhost:{port}"),
    };

    {
        let server = server.clone();
        tokio::spawn(async move {
            let (rx_id, mut rx) = server.subscribe().await;
            while let Some(event) = rx.recv().await {
                match event.clone() {
                    InternalEvent {
                        payload: InternalEventPayload::BootResponse(resp),
                        plugin_ref_id,
                        ..
                    } => {
                        server.boot_plugin(plugin_ref_id.as_str(), &resp).await;
                    }
                    _ => {}
                };
            }
            server.unsubscribe(rx_id.as_str()).await;
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
            .await
            .expect("grpc plugin runtime server failed to start");
    });

    Ok((server, addr))
}

async fn read_plugins_dir(dir: &PathBuf) -> Result<Vec<String>> {
    let mut result = read_dir(dir).await?;
    let mut dirs: Vec<String> = vec![];
    while let Ok(Some(entry)) = result.next_entry().await {
        if entry.path().is_dir() {
            #[cfg(target_os = "windows")]
            dirs.push(fix_windows_paths(&entry.path()));
            #[cfg(not(target_os = "windows"))]
            dirs.push(entry.path().to_string_lossy().to_string());
        }
    }
    Ok(dirs)
}

#[cfg(target_os = "windows")]
fn fix_windows_paths(p: &PathBuf) -> String {
    use dunce;
    use path_slash::PathBufExt;
    use regex::Regex;

    // 1. Remove UNC prefix for Windows paths to pass to sidecar
    let safe_path = dunce::simplified(p.as_path()).to_string_lossy().to_string();

    // 2. Remove the drive letter
    let safe_path = Regex::new("^[a-zA-Z]:")
        .unwrap()
        .replace(safe_path.as_str(), "");

    // 3. Convert backslashes to forward
    let safe_path = PathBuf::from(safe_path.to_string())
        .to_slash_lossy()
        .to_string();

    safe_path
}
