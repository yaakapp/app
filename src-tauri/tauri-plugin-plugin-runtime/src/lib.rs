extern crate core;

use log::info;
use crate::manager::PluginManager;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, RunEvent, Runtime, State};
use tokio::sync::Mutex;

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
                let manager_state = Mutex::new(manager);
                app.manage(manager_state);
                Ok(())
            })
        })
        .on_event(|app, e| match e {
            RunEvent::ExitRequested { code, .. } => {
                tauri::async_runtime::block_on(async move {
                    info!("Exiting plugin runtime because of app exit {:?}", code);
                    let manager: State<Mutex<PluginManager>> = app.state();
                    manager.lock().await.cleanup();
                });
            }
            _ => {}
        })
        .build()
}
