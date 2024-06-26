use std::path::{Path, PathBuf};
use std::process::ExitStatus;
use std::time::Duration;

use log::{info, warn};
use rand::distributions::{Alphanumeric, DistString};
use serde;
use serde::Deserialize;
use tokio::fs;
use tokio::process::Command;

use crate::archive::extract_archive;

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct PortFile {
    port: i32,
}

pub async fn npm_install() -> ExitStatus {
    info!("Running npm install");
    Command::new("/Users/gschier/Desktop/foo/bin/npm")
        .current_dir("/Users/gschier/Workspace/yaak/plugin-runtime")
        .args(["install"])
        .spawn()
        .unwrap()
        .wait()
        .await
        .unwrap()
}

pub async fn node_start(temp_dir: &PathBuf) -> String {
    let port_file_path = temp_dir.join(Alphanumeric.sample_string(&mut rand::thread_rng(), 10));

    info!(
        "Starting plugin runtime port_file={}",
        port_file_path.to_string_lossy()
    );

    Command::new("/Users/gschier/Desktop/foo/bin/node")
        .env("GRPC_PORT_FILE_PATH", port_file_path.clone())
        .current_dir("/Users/gschier/Workspace/yaak/plugin-runtime")
        .args(["-r", "ts-node/register", "./src/index.ts"])
        .spawn()
        .unwrap();

    let start = std::time::Instant::now();
    let port_file_contents = loop {
        if start.elapsed().as_millis() > 10000 {
            panic!("Failed to read port file in time");
        }
        match fs::read_to_string(port_file_path.clone()).await {
            Ok(s) => break s,
            Err(err) => {
                warn!("Failed to read port file {}", err.to_string());
                tokio::time::sleep(Duration::from_millis(300)).await;
            }
        }
    };

    let port_file: PortFile = serde_json::from_str(port_file_contents.as_str()).unwrap();
    format!("http://localhost:{}", port_file.port)
}

pub async fn ensure_nodejs() -> Result<(), String> {
    let version = "v22.3.0";
    let os = get_os();
    let arch = get_arch();
    let ext = get_ext();
    let url =
        format!("https://nodejs.org/download/release/{version}/node-{version}-{os}-{arch}.{ext}");
    info!("Downloading NodeJS {version} from {url}");

    let res = reqwest::get(url).await.unwrap();
    let bytes = res.bytes().await.unwrap();
    extract_archive(bytes.to_vec(), Path::new("/Users/gschier/Desktop/foo"))
        .map_err(|e| e.to_string())
}

fn get_os() -> &'static str {
    if cfg!(target_os = "windows") {
        "win"
    } else if cfg!(target_os = "macos") {
        "darwin"
    } else {
        "linux"
    }
}

fn get_ext() -> &'static str {
    if cfg!(target_os = "windows") {
        "zip"
    } else {
        "tar.gz"
    }
}

fn get_arch() -> &'static str {
    if cfg!(target_arch = "x86_64") {
        "x64"
    } else if cfg!(target_arch = "x86") {
        "x64" // Not sure if possible
    } else {
        "arm64" // Not sure if possible
    }
}
