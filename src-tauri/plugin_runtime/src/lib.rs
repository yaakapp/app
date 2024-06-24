use crate::plugin_runtime::HookFilterRequest;
use plugin_runtime::plugin_runtime_client::PluginRuntimeClient;
use plugin_runtime::HookImportRequest;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

pub async fn run_import(data: &str) -> Result<String, String> {
    let mut client = PluginRuntimeClient::connect("http://127.0.0.1:50051")
        .await
        .map_err(|e| e.to_string())?;

    let response = client
        .hook_import(tonic::Request::new(HookImportRequest {
            data: data.to_string(),
        }))
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.into_inner().data)
}

pub async fn run_filter(filter: &str, body: &str) -> Result<String, String> {
    let mut client = PluginRuntimeClient::connect("http://127.0.0.1:50051")
        .await
        .map_err(|e| e.to_string())?;
    let response = client
        .hook_filter(tonic::Request::new(HookFilterRequest {
            filter: filter.to_string(),
            body: body.to_string(),
        }))
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.into_inner().data)
}
