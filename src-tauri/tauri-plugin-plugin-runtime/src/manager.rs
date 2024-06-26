use log::info;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, Runtime};
use tokio::sync::Mutex;
use tonic::transport::Channel;

use crate::nodejs::{ensure_nodejs, node_start, npm_install};
use crate::plugin_runtime::plugin_runtime_client::PluginRuntimeClient;
use crate::plugin_runtime::{HookFilterRequest, HookImportRequest};

pub struct PluginManager {
    client: Mutex<PluginRuntimeClient<Channel>>,
}

impl PluginManager {
    pub async fn new<R: Runtime>(app_handle: &AppHandle<R>) -> PluginManager {
        let temp_dir = app_handle.path().temp_dir().unwrap();
        let node_dir = app_handle
            .path()
            .resolve("./nodejs", BaseDirectory::AppData)
            .unwrap();

        ensure_nodejs(&node_dir).await.unwrap();
        npm_install(&node_dir).await;
        
        let addr = node_start(&temp_dir, &node_dir).await;
        info!("Connecting to gRPC client at {addr}");

        let client = match PluginRuntimeClient::connect(addr.clone()).await {
            Ok(v) => v,
            Err(err) => {
                panic!("{}", err.to_string());
            }
        };

        PluginManager {
            client: Mutex::new(client),
        }
    }

    pub async fn run_import(&self, data: &str) -> Result<String, String> {
        let response = self
            .client
            .lock()
            .await
            .hook_import(tonic::Request::new(HookImportRequest {
                data: data.to_string(),
            }))
            .await
            .map_err(|e| e.message().to_string())?;

        Ok(response.into_inner().data)
    }

    pub async fn run_filter(
        &self,
        filter: &str,
        body: &str,
        content_type: &str,
    ) -> Result<String, String> {
        let response = self
            .client
            .lock()
            .await
            .hook_filter(tonic::Request::new(HookFilterRequest {
                filter: filter.to_string(),
                body: body.to_string(),
                content_type: content_type.to_string(),
            }))
            .await
            .map_err(|e| e.message().to_string())?;

        Ok(response.into_inner().data)
    }
}
