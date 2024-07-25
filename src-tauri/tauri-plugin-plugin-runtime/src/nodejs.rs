use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;

use command_group::CommandGroup;
use log::{debug, error, info};
use rand::distributions::{Alphanumeric, DistString};
use serde;
use serde::Deserialize;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_shell::ShellExt;
use tokio::fs;
use tokio::sync::watch::Receiver;

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct PortFile {
    port: i32,
}

pub struct StartResp {
    pub addr: String,
}

pub async fn node_start<R: Runtime>(
    app: &AppHandle<R>,
    temp_dir: &PathBuf,
    kill_rx: &Receiver<bool>,
) -> StartResp {
    let port_file_path = temp_dir.join(Alphanumeric.sample_string(&mut rand::thread_rng(), 10));

    let plugins_dir = app
        .path()
        .resolve("plugins", BaseDirectory::Resource)
        .expect("failed to resolve plugin directory resource");

    let plugin_runtime_main = app
        .path()
        .resolve("plugin-runtime", BaseDirectory::Resource)
        .expect("failed to resolve plugin runtime resource")
        .join("index.cjs");

    // HACK: Remove UNC prefix for Windows paths to pass to sidecar

    let plugins_dir = dunce::simplified(plugins_dir.as_path())
        .to_string_lossy()
        .to_string();
    let plugin_runtime_main = dunce::simplified(plugin_runtime_main.as_path())
        .to_string_lossy()
        .to_string();

    info!(
        "Starting plugin runtime\n → port_file={}\n → plugins_dir={}\n → runtime_dir={}",
        port_file_path.to_string_lossy(),
        plugins_dir,
        plugin_runtime_main,
    );

    let cmd = app
        .shell()
        .sidecar("yaaknode")
        .expect("yaaknode not found")
        .env("YAAK_GRPC_PORT_FILE_PATH", port_file_path.clone())
        .env("YAAK_PLUGINS_DIR", plugins_dir)
        .args(&[plugin_runtime_main]);

    println!("Waiting on plugin runtime");
    let mut child = Command::from(cmd)
        .group_spawn()
        .expect("yaaknode failed to start");

    let kill_rx = kill_rx.clone();

    // Check on child
    tokio::spawn(async move {
        loop {
            if let Ok(Some(status)) = child.try_wait() {
                error!("Plugin runtime exited status={}", status);
                // TODO: Try restarting plugin runtime
                break;
            } else if *kill_rx.borrow() {
                info!("Stopping plugin runtime");
                child.kill().expect("Failed to kill plugin runtime");
                break;
            }
        }
    });

    let start = std::time::Instant::now();
    let port_file_contents = loop {
        if start.elapsed().as_millis() > 30000 {
            panic!("Failed to read port file in time");
        }

        match fs::read_to_string(port_file_path.clone()).await {
            Ok(s) => break s,
            Err(err) => {
                debug!("Failed to read port file {}", err.to_string());
                tokio::time::sleep(Duration::from_millis(500)).await;
            }
        }
    };

    let port_file: PortFile = serde_json::from_str(port_file_contents.as_str()).unwrap();
    info!("Started plugin runtime on :{}", port_file.port);
    let addr = format!("http://localhost:{}", port_file.port);

    StartResp { addr }
}
