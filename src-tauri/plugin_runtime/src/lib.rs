extern crate core;

use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime};

use crate::manager::PluginManager;

pub mod manager;

pub mod plugin_runtime {
    tonic::include_proto!("yaak.plugins.runtime");
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("plugin_runtime")
        .setup(|app, _| {
            tauri::async_runtime::block_on(async move {
                match PluginManager::new().await {
                    Ok(m) => {
                        app.manage(m);
                        Ok(())
                    }
                    Err(err) => Err(err).map_err(|e| e.into()),
                }
            })
        })
        .build()
}
