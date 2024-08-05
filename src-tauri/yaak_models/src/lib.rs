use std::env::current_dir;
use std::fs::create_dir_all;
use r2d2;
use r2d2_sqlite;

use log::info;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use serde::Deserialize;
use tauri::async_runtime::Mutex;
use tauri::plugin::TauriPlugin;
use tauri::{is_dev, plugin, Manager, Runtime};

pub mod models;
pub mod queries;

pub struct SqliteConnection(Mutex<Pool<SqliteConnectionManager>>);

#[derive(Default, Deserialize)]
pub struct PluginConfig {
    // Nothing yet (will be configurable in tauri.conf.json
}

/// Tauri SQL plugin builder.
#[derive(Default)]
pub struct Builder {
    // Nothing Yet
}

impl Builder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn build<R: Runtime>(&self) -> TauriPlugin<R, Option<PluginConfig>> {
        plugin::Builder::<R, Option<PluginConfig>>::new("yaak_models")
            .setup(|app, _api| {
                let app_path = match is_dev() {
                    true => current_dir().unwrap(),
                    false => app.path().app_data_dir().unwrap(),
                };

                create_dir_all(app_path.clone()).expect("Problem creating App directory!");

                let db_file_path = app_path.join("db.sqlite");
                info!("Opening SQLite DB at {db_file_path:?}");

                let manager = SqliteConnectionManager::file(db_file_path);
                let pool = Pool::new(manager).unwrap();

                app.manage(SqliteConnection(Mutex::new(pool)));

                Ok(())
            })
            .build()
    }
}
