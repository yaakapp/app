use std::path::PathBuf;
use std::time::Duration;

use log::{debug, info};
use rand::distributions::{Alphanumeric, DistString};
use serde;
use serde::Deserialize;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tokio::fs;

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct PortFile {
    port: i32,
}

pub async fn node_start<R: Runtime>(app: &AppHandle<R>, temp_dir: &PathBuf) -> String {
    let port_file_path = temp_dir.join(Alphanumeric.sample_string(&mut rand::thread_rng(), 10));

    let plugins_dir = app
        .path()
        .resolve("plugins", BaseDirectory::Resource)
        .expect("failed to resolve plugin directory resource")
        .to_string_lossy()
        .to_string();

    let plugin_runtime_dir = app
        .path()
        .resolve("plugin-runtime", BaseDirectory::Resource)
        .expect("failed to resolve plugin runtime resource");

    // HACK: Remove UNC prefix for Windows paths
    let plugins_dir = plugins_dir.replace("\\\\?\\", "");

    info!(
        "Starting plugin runtime port_file={} plugins_dir={}",
        port_file_path.to_string_lossy(),
        plugins_dir,
    );

    let (mut rx, _child) = app
        .shell()
        .sidecar("node")
        .unwrap()
        .env("GRPC_PORT_FILE_PATH", port_file_path.clone())
        .env("PLUGINS_DIR", plugins_dir)
        .args(&[plugin_runtime_dir.join("index.cjs")])
        .spawn()
        .unwrap();

    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                println!("{}", String::from_utf8_lossy(line.as_slice()));
            } else if let CommandEvent::Stderr(line) = event {
                println!("{}", String::from_utf8_lossy(line.as_slice()));
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
    format!("http://localhost:{}", port_file.port)
}
