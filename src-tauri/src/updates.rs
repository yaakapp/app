use std::time::SystemTime;

use log::info;
use tauri::{AppHandle, updater, Window, Wry};
use tauri::api::dialog;

// Check for updates every 3 hours
const MAX_UPDATE_CHECK_SECONDS: u64 = 60 * 60 * 3;

// Create updater struct
pub struct YaakUpdater {
    last_update_check: SystemTime,
}

pub enum UpdateMode {
    Stable,
    Beta,
}

impl YaakUpdater {
    pub fn new() -> Self {
        Self {
            last_update_check: SystemTime::UNIX_EPOCH,
        }
    }
    pub async fn force_check(
        &mut self,
        app_handle: &AppHandle<Wry>,
        mode: UpdateMode,
    ) -> Result<(), updater::Error> {
        self.last_update_check = SystemTime::now();
        let update_mode = get_update_mode_str(mode);
        info!("Checking for updates mode={}", update_mode);
        match app_handle
            .updater()
            .header("X-Update-Mode", update_mode)?
            .check()
            .await
        {
            Ok(update) => {
                if dialog::blocking::ask(
                    None::<&Window>,
                    "Update available",
                    format!("{} is available. Would you like to download and install it now?", update.latest_version()),
                ) {
                    _ = update.download_and_install().await;
                }
                Ok(())
            }
            Err(updater::Error::UpToDate) => Ok(()),
            Err(e) => Err(e),
        }
    }
    pub async fn check(
        &mut self,
        app_handle: &AppHandle<Wry>,
        mode: UpdateMode,
    ) -> Result<(), updater::Error> {
        if self.last_update_check.elapsed().unwrap().as_secs() < MAX_UPDATE_CHECK_SECONDS {
            return Ok(());
        }

        self.force_check(app_handle, mode).await
    }
}

pub fn update_mode_from_str(mode: &str) -> UpdateMode {
    match mode {
        "beta" => UpdateMode::Beta,
        _ => UpdateMode::Stable,
    }
}

fn get_update_mode_str(mode: UpdateMode) -> &'static str {
    match mode {
        UpdateMode::Stable => "stable",
        UpdateMode::Beta => "beta",
    }
}
