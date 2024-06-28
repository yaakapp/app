use std::path::{Path, PathBuf};
use std::process::ExitStatus;
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
use tokio::process::Command;

use crate::archive::extract_archive;

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct PortFile {
    port: i32,
}

const NODE_VERSION: &str = "v22.3.0";
const NODE_REL_BIN: &str = "bin/node";
const NPM_REL_BIN: &str = "bin/npm";

const PLUGIN_RUNTIME_DIR: &str = "/Users/gschier/Workspace/yaak/plugin-runtime";

pub async fn npm_install(node_dir: &PathBuf) -> ExitStatus {
    info!("Running npm install");
    let npm_path = Path::new(node_dir).join(NPM_REL_BIN);
    Command::new(npm_path)
        .current_dir(PLUGIN_RUNTIME_DIR)
        .args(["install"])
        .spawn()
        .unwrap()
        .wait()
        .await
        .unwrap()
}

pub async fn node_start<R: Runtime>(app: &AppHandle<R>, temp_dir: &PathBuf) -> String {
    let port_file_path = temp_dir.join(Alphanumeric.sample_string(&mut rand::thread_rng(), 10));

    let plugins_dir = app
        .path()
        .resolve("plugins", BaseDirectory::Resource)
        .expect("failed to resolve plugin directory resource");

    info!(
        "Starting plugin runtime port_file={} plugins_dir={}",
        port_file_path.to_string_lossy(),
        plugins_dir.to_string_lossy(),
    );

    let (mut rx, _child) = app
        .shell()
        .sidecar("yaakplugins")
        .unwrap()
        .env("GRPC_PORT_FILE_PATH", port_file_path.clone())
        .env("PLUGINS_DIR", plugins_dir)
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
    format!("http://localhost:{}", port_file.port)
}

pub async fn ensure_nodejs(node_dir: &PathBuf) -> Result<(), String> {
    let version = check_nodejs_version(node_dir)
        .await
        .unwrap_or("__NONE__".to_string());
    if version == NODE_VERSION {
        info!(
            "Using existing NodeJS version {version} at {}",
            node_dir.to_string_lossy()
        );
        return Ok(());
    }

    let url = release_url();
    info!("Downloading NodeJS ({version} != {NODE_VERSION}) from {url}");

    let res = reqwest::get(url).await.unwrap();
    let bytes = res.bytes().await.unwrap();
    extract_archive(bytes.to_vec(), Path::new(node_dir)).map_err(|e| e.to_string())
}

#[allow(unused)]
async fn check_nodejs_version(node_dir: &PathBuf) -> Option<String> {
    let node_path = Path::new(node_dir).join(NODE_REL_BIN);
    let stdout = match Command::new(node_path.clone())
        .args(["--version"])
        .output()
        .await
    {
        Ok(v) => v.stdout,
        Err(err) => {
            info!("Failed to check NodeJS version {}", err);
            return None;
        }
    };

    let version = String::from_utf8(stdout).unwrap();
    let version = version.trim().to_string(); // Trim any space

    Some(version)
}

fn release_url() -> String {
    let os = if cfg!(target_os = "windows") {
        "win"
    } else if cfg!(target_os = "macos") {
        "darwin"
    } else {
        "linux"
    };

    let arch = if cfg!(target_arch = "x86_64") {
        "x64"
    } else if cfg!(target_arch = "x86") {
        "x64" // Not sure if possible
    } else {
        "arm64" // Not sure if possible
    };

    let ext = if cfg!(target_os = "windows") {
        "zip"
    } else {
        "tar.gz"
    };

    format!(
        "https://nodejs.org/download/release/{NODE_VERSION}/node-{NODE_VERSION}-{os}-{arch}.{ext}"
    )
}
