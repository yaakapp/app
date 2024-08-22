use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use yaak_plugin_runtime::events::CallTemplateFunctionPurpose;
use yaak_plugin_runtime::manager::PluginManager;
use yaak_templates::TemplateCallback;

#[derive(Clone)]
pub struct PluginTemplateCallback {
    app_handle: AppHandle,
    purpose: CallTemplateFunctionPurpose,
}

impl PluginTemplateCallback {
    pub fn new(app_handle: AppHandle) -> PluginTemplateCallback {
        PluginTemplateCallback { app_handle, purpose: CallTemplateFunctionPurpose::Preview }
    }

    pub fn for_send(&self) -> PluginTemplateCallback {
        let mut v = self.clone();
        v.purpose = CallTemplateFunctionPurpose::Send;
        v
    }
}

impl TemplateCallback for PluginTemplateCallback {
    async fn run(&self, fn_name: &str, args: HashMap<String, String>) -> Result<String, String> {
        let plugin_manager = self.app_handle.state::<PluginManager>();
        let resp = plugin_manager
            .call_template_function(fn_name, args, self.purpose.clone())
            .await
            .map_err(|e| e.to_string())?;
        Ok(resp.unwrap_or_default())
    }
}
