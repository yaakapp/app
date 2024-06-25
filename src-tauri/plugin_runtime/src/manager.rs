use tokio::sync::Mutex;
use tonic::transport::Channel;
use crate::nodejs::ensure_nodejs;

use crate::plugin_runtime::plugin_runtime_client::PluginRuntimeClient;
use crate::plugin_runtime::{HookFilterRequest, HookImportRequest};

pub struct PluginManager(Mutex<PluginRuntimeClient<Channel>>);

impl PluginManager {
    pub async fn new() -> Result<PluginManager, String> {
        let client = PluginRuntimeClient::connect("http://127.0.0.1:4000")
            .await
            .map_err(|e| e.to_string())?;
        let m = PluginManager(Mutex::new(client));
        ensure_nodejs().await.unwrap();
        Ok(m)
    }

    pub async fn run_import(&self, data: &str) -> Result<String, String> {
        let response = self
            .0
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
            .0
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
