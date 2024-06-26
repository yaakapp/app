extern crate core;

use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime};

use crate::manager::PluginManager;

mod archive;
pub mod manager;
mod nodejs;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("plugin_runtime")
        .setup(|app, _| {
            tauri::async_runtime::block_on(async move {
                let manager = PluginManager::new(&app).await;
                app.manage(manager);
                Ok(())
            })
        })
        .build()
}
