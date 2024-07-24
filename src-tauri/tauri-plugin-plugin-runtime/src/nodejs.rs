use std::path::{Path, PathBuf};
use std::process::Command as StdCommand;
use std::time::Duration;

use crate::archive::extract_archive;
use command_group::{CommandGroup, GroupChild};
use log::{debug, info};
use rand::distributions::{Alphanumeric, DistString};
use serde;
use serde::Deserialize;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, Runtime};
use tokio::fs;
use tokio::process::Command as TokioCommand;

const NODE_VERSION: &str = "v22.5.1";
const NODE_REL_BIN: &str = "bin/node";

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct PortFile {
    port: i32,
}

pub struct StartResp {
    pub addr: String,
    pub child: GroupChild,
}

pub async fn node_start<R: Runtime>(app: &AppHandle<R>, temp_dir: &PathBuf) -> StartResp {
    ensure_nodejs(app).await.unwrap();
    
    let port_file_path = temp_dir.join(Alphanumeric.sample_string(&mut rand::thread_rng(), 10));
    let node_bin = get_node_dir(app).join(NODE_REL_BIN);

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
        "Starting plugin runtime\n  port_file={}\n  plugins_dir={}\n  runtime_dir={}",
        port_file_path.to_string_lossy(),
        plugins_dir,
        plugin_runtime_dir.to_string_lossy(),
    );

    let child = StdCommand::new(node_bin)
        .env("YAAK_GRPC_PORT_FILE_PATH", port_file_path.clone())
        .env("YAAK_PLUGINS_DIR", plugins_dir)
        .args(&[plugin_runtime_dir.join("index.cjs")])
        .group_spawn()
        .expect("node failed to start");

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

    StartResp { addr, child }
}

pub fn get_node_dir<R: Runtime>(app_handle: &AppHandle<R>) -> PathBuf {
    app_handle
        .path()
        .resolve("./nodejs", BaseDirectory::AppData)
        .unwrap()
}

pub async fn ensure_nodejs<R: Runtime>(app_handle: &AppHandle<R>) -> Result<(), String> {
    let node_dir = get_node_dir(app_handle);
    let version = check_nodejs_version(&node_dir)
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
    tokio::time::sleep(Duration::from_secs(60)).await;

    let res = reqwest::get(url).await.unwrap();
    let bytes = res.bytes().await.unwrap();

    info!("Extracting NodeJS");
    extract_archive(bytes.to_vec(), Path::new(&node_dir)).map_err(|e| e.to_string())
}

async fn check_nodejs_version(node_dir: &PathBuf) -> Option<String> {
    let node_path = Path::new(node_dir).join(NODE_REL_BIN);
    let stdout = match TokioCommand::new(node_path.clone())
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
