use std::{fs, io};

use log::error;
use serde::{Deserialize, Serialize};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use thiserror::Error;

use crate::deno::{get_plugin_capabilities_block, run_plugin_block};
use crate::models::{HttpRequest, WorkspaceExportResources};

#[derive(Error, Debug)]
pub enum PluginError {
    #[error("directory not found")]
    DirectoryNotFound(#[from] io::Error),
    #[error("anyhow error")]
    V8(#[from] anyhow::Error),
    // #[error("unknown data store error")]
    // Unknown,
}

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct FilterResult {
    pub filtered: String,
}

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct ImportResult {
    pub resources: WorkspaceExportResources,
}

#[derive(Eq, PartialEq, Hash, Clone)]
pub enum PluginCapability {
    Export,
    Import,
    Filter,
}

pub struct PluginDef {
    pub name: String,
    pub path: String,
    pub capabilities: Vec<PluginCapability>,
}

pub fn scan_plugins(app_handle: &AppHandle) -> Result<Vec<PluginDef>, PluginError> {
    let plugins_dir = app_handle
        .path()
        .resolve("plugins", BaseDirectory::Resource)
        .expect("failed to resolve plugin directory resource");

    let plugin_entries = fs::read_dir(plugins_dir)?;

    let mut plugins = Vec::new();
    for entry in plugin_entries {
        let plugin_dir_entry = match entry {
            Err(_) => continue,
            Ok(entry) => entry,
        };

        let plugin_index_file = plugin_dir_entry.path().join("index.mjs");
        let capabilities = get_plugin_capabilities_block(&plugin_index_file.to_str().unwrap())?;

        plugins.push(PluginDef {
            name: plugin_dir_entry.file_name().to_string_lossy().to_string(),
            path: plugin_index_file.to_string_lossy().to_string(),
            capabilities,
        });
    }

    Ok(plugins)
}

pub async fn find_plugins(
    app_handle: &AppHandle,
    capability: &PluginCapability,
) -> Result<Vec<PluginDef>, PluginError> {
    let plugins = scan_plugins(app_handle)?
        .into_iter()
        .filter(|p| p.capabilities.contains(capability))
        .collect();
    Ok(plugins)
}

pub fn get_plugin(app_handle: &AppHandle, name: &str) -> Result<Option<PluginDef>, PluginError> {
    Ok(scan_plugins(app_handle)?
        .into_iter()
        .find(|p| p.name == name))
}

pub async fn run_plugin_filter(
    response_body: &str,
    filter: &str,
    _plugin_name: &str,
) -> Result<String, String> {
    plugin_runtime::run_filter(filter, response_body).await
}

pub fn run_plugin_export_curl(
    app_handle: &AppHandle,
    request: &HttpRequest,
) -> Result<String, String> {
    let plugin = match get_plugin(app_handle, "exporter-curl").map_err(|e| e.to_string())? {
        None => return Err("Failed to get plugin".into()),
        Some(p) => p,
    };

    let request_json = serde_json::to_value(request).map_err(|e| e.to_string())?;
    let result = run_plugin_block(&plugin.path, "pluginHookExport", vec![request_json])
        .map_err(|e| e.to_string())?;

    let export_str: String = serde_json::from_value(result).map_err(|e| e.to_string())?;
    Ok(export_str)
}

pub async fn run_plugin_import(
    plugin: &PluginDef,
    file_contents: &str,
) -> Result<Option<ImportResult>, String> {
    let result = run_plugin_block(
        &plugin.path,
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
