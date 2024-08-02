use std::time::Duration;

use log::info;
use tauri::{AppHandle, Manager, Runtime};
use tokio::sync::watch::Sender;
use tonic::transport::Channel;

use crate::nodejs::node_start;
use crate::plugin_runtime::plugin_runtime_client::PluginRuntimeClient;
use crate::plugin_runtime::{
    CallFileImportRequest, CallFileImportResponse, GetFileImportersRequest,
    GetFileImportersResponse,
};

pub struct PluginManager {
    pub client: PluginRuntimeClient<Channel>,
    kill_tx: Sender<bool>,
}

impl PluginManager {
    pub async fn new<R: Runtime>(app_handle: &AppHandle<R>) -> PluginManager {
        let temp_dir = app_handle.path().temp_dir().unwrap();

        let (kill_tx, kill_rx) = tokio::sync::watch::channel(false);
        let start_resp = node_start(app_handle, &temp_dir, &kill_rx).await;
        info!("Connecting to gRPC client at {}", start_resp.addr);

        let client = match PluginRuntimeClient::connect(start_resp.addr.clone()).await {
            Ok(v) => v,
            Err(err) => panic!("{}", err.to_string()),
        };

        PluginManager { client, kill_tx }
    }

    pub async fn cleanup(&mut self) {
        self.kill_tx.send_replace(true);

        // Give it a bit of time to kill
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    pub async fn get_file_importers(&mut self) -> Result<GetFileImportersResponse, String> {
        let response = self
            .client
            .get_file_importers(tonic::Request::new(GetFileImportersRequest {}))
            .await
            .map_err(|e| e.message().to_string())?;

        Ok(response.into_inner())
    }

    pub async fn call_file_importer(
        &mut self,
        file_content: &str,
    ) -> Result<CallFileImportResponse, String> {
        let response = self
            .client
            .call_file_import(tonic::Request::new(CallFileImportRequest {
                file_content: file_content.into(),
            }))
            .await
            .map_err(|e| e.message().to_string())?;

        Ok(response.into_inner())
    }
}
