use std::path;

use log::error;
use serde::{Deserialize, Serialize};

use crate::deno::run_plugin_deno_block;
use crate::models::{HttpRequest, WorkspaceExportResources};

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct FilterResult {
    pub filtered: String,
}

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct ImportResult {
    pub resources: WorkspaceExportResources,
}

pub async fn run_plugin_filter(
    plugin_name: &str,
    response_body: &str,
    filter: &str,
) -> Option<FilterResult> {
    let plugin_dir = path::Path::new("/Users/gschier/Workspace/yaak/plugins");
    let plugin_index_file = plugin_dir.join(plugin_name).join("build/index.mjs");

    let result = run_plugin_deno_block(
        plugin_index_file.to_str().unwrap(),
        "pluginHookResponseFilter",
        vec![
            serde_json::to_value(response_body).unwrap(),
            serde_json::to_value(filter).unwrap(),
        ],
    )
    .map_err(|e| e.to_string())
    .expect("Failed to run plugin");

    if result.is_null() {
        error!("Plugin {} failed to run", plugin_name);
        return None;
    }

    let resources: FilterResult =
        serde_json::from_value(result).expect("failed to parse filter plugin result json");
    Some(resources)
}

pub fn run_plugin_export_curl(request: &HttpRequest) -> Result<String, String> {
    let plugin_dir = path::Path::new("/Users/gschier/Workspace/yaak/plugins");
    let plugin_index_file = plugin_dir.join("exporter-curl").join("build/index.mjs");

    let request_json = serde_json::to_value(request).map_err(|e| e.to_string())?;
    let result = run_plugin_deno_block(
        plugin_index_file.to_str().unwrap(),
        "pluginHookExport",
        vec![request_json],
    )
    .map_err(|e| e.to_string())?;

    let export_str: String = serde_json::from_value(result).map_err(|e| e.to_string())?;
    Ok(export_str)
}

pub async fn run_plugin_import(
    plugin_name: &str,
    file_contents: &str,
) -> Result<Option<ImportResult>, String> {
    let plugin_dir = path::Path::new("/Users/gschier/Workspace/yaak/plugins");
    let plugin_index_file = plugin_dir.join(plugin_name).join("build/index.mjs");

    let result = run_plugin_deno_block(
        plugin_index_file.to_str().unwrap(),
        "pluginHookImport",
        vec![serde_json::to_value(file_contents).map_err(|e| e.to_string())?],
    )
    .map_err(|e| e.to_string())?;

    if result.is_null() {
        return Ok(None);
    }

    let resources: ImportResult = serde_json::from_value(result).map_err(|e| e.to_string())?;
    Ok(Some(resources))
}
