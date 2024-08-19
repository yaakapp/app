use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use yaak_plugin_runtime::manager::PluginManager;
use yaak_templates::TemplateCallback;

pub struct PluginTemplateCallback {
    app_handle: AppHandle,
}

impl PluginTemplateCallback {
    pub fn new(app_handle: AppHandle) -> PluginTemplateCallback {
        PluginTemplateCallback { app_handle }
    }
}

impl TemplateCallback for PluginTemplateCallback {
    async fn run(&self, fn_name: &str, args: HashMap<String, String>) -> Result<String, String> {
        let plugin_manager = self.app_handle.state::<PluginManager>();
        let resp = plugin_manager
            .call_template_function(fn_name, args)
            .await
            .map_err(|e| e.to_string())?;
        Ok(resp.unwrap_or_default())
    }
}
