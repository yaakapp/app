use std::{fs, io};

use log::error;
use serde::{Deserialize, Serialize};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use thiserror::Error;

use crate::deno::run_plugin_block;
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
pub struct ImportResult {
    pub resources: WorkspaceExportResources,
}

pub struct PluginDef {
    pub name: String,
    pub path: String,
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

        plugins.push(PluginDef {
            name: plugin_dir_entry.file_name().to_string_lossy().to_string(),
            path: plugin_index_file.to_string_lossy().to_string(),
        });
    }

    Ok(plugins)
}

pub fn get_plugin(app_handle: &AppHandle, name: &str) -> Result<Option<PluginDef>, PluginError> {
    Ok(scan_plugins(app_handle)?
        .into_iter()
        .find(|p| p.name == name))
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
