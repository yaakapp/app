use command_group::GroupChild;
use log::{debug, info};
use tauri::{AppHandle, Manager, Runtime};
use tonic::transport::Channel;

use crate::nodejs::node_start;
use crate::plugin_runtime::plugin_runtime_client::PluginRuntimeClient;
use crate::plugin_runtime::{
    HookExportRequest, HookImportRequest, HookResponse, HookResponseFilterRequest,
};

pub struct PluginManager {
    client: PluginRuntimeClient<Channel>,
    child: GroupChild,
}

impl PluginManager {
    pub async fn new<R: Runtime>(app_handle: &AppHandle<R>) -> PluginManager {
        let temp_dir = app_handle.path().temp_dir().unwrap();

        let start_resp = node_start(app_handle, &temp_dir).await;
        info!("Connecting to gRPC client at {}", start_resp.addr);

        let client = match PluginRuntimeClient::connect(start_resp.addr.clone()).await {
            Ok(v) => v,
            Err(err) => {
                panic!("{}", err.to_string());
            }
        };

        PluginManager {
            client,
            child: start_resp.child,
        }
    }

    pub fn cleanup(&mut self) {
        info!("Cleaning up NodeJS process");
        self.child.kill().unwrap();
    }

    pub async fn run_import(&mut self, data: &str) -> Result<HookResponse, String> {
        let response = self
            .client
            .hook_import(tonic::Request::new(HookImportRequest {
                data: data.to_string(),
            }))
            .await
            .map_err(|e| e.message().to_string())?;

        Ok(response.into_inner())
    }

    pub async fn run_export_curl(&mut self, request: &str) -> Result<HookResponse, String> {
        let response = self
            .client
            .hook_export(tonic::Request::new(HookExportRequest {
                request: request.to_string(),
            }))
            .await
            .map_err(|e| e.message().to_string())?;

        Ok(response.into_inner())
    }

    pub async fn run_response_filter(
        &mut self,
        filter: &str,
        body: &str,
        content_type: &str,
    ) -> Result<HookResponse, String> {
        debug!("Running plugin filter");
        let response = self
            .client
            .hook_response_filter(tonic::Request::new(HookResponseFilterRequest {
                filter: filter.to_string(),
                body: body.to_string(),
                content_type: content_type.to_string(),
            }))
            .await
            .map_err(|e| e.message().to_string())?;

        let result = response.into_inner();
        debug!("Ran plugin response filter {}", result.data);
        Ok(result)
    }
}
