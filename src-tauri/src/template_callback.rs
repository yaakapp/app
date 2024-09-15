use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use yaak_plugin_runtime::events::{RenderPurpose, FormInput};
use yaak_plugin_runtime::manager::PluginManager;
use yaak_templates::TemplateCallback;

#[derive(Clone)]
pub struct PluginTemplateCallback {
    app_handle: AppHandle,
    purpose: RenderPurpose,
}

impl PluginTemplateCallback {
    pub fn new(app_handle: AppHandle) -> PluginTemplateCallback {
        PluginTemplateCallback {
            app_handle,
            purpose: RenderPurpose::Preview,
        }
    }

    pub fn for_send(&self) -> PluginTemplateCallback {
        let mut v = self.clone();
        v.purpose = RenderPurpose::Send;
        v
    }
}

impl TemplateCallback for PluginTemplateCallback {
    async fn run(&self, fn_name: &str, args: HashMap<String, String>) -> Result<String, String> {
        // The beta named the function `Response` but was changed in stable.
        // Keep this here for a while because there's no easy way to migrate
        let fn_name = if fn_name == "Response" {
            "response"
        } else {
            fn_name
        };
        
        let plugin_manager = self.app_handle.state::<PluginManager>();
        let function = plugin_manager
            .get_template_functions()
            .await
            .map_err(|e| e.to_string())?
            .iter()
            .flat_map(|f| f.functions.clone())
            .find(|f| f.name == fn_name)
            .ok_or("")?;

        let mut args_with_defaults = args.clone();
        
        // Fill in default values for all args
        for a_def in function.args {
            let base = match a_def {
                FormInput::Text(a) => a.base,
                FormInput::Select(a) => a.base,
                FormInput::Checkbox(a) => a.base,
                FormInput::HttpRequest(a) => a.base,
            };
            if let None = args_with_defaults.get(base.name.as_str()) {
                args_with_defaults.insert(base.name, base.default_value.unwrap_or_default());
            }
        }

        let resp = plugin_manager
            .call_template_function(fn_name, args_with_defaults, self.purpose.clone())
            .await
            .map_err(|e| e.to_string())?;
        Ok(resp.unwrap_or_default())
    }
}
