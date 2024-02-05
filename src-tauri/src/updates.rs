use std::time::SystemTime;

use log::info;
use tauri::api::dialog;
use tauri::{updater, AppHandle, Window};

use crate::is_dev;

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
        app_handle: &AppHandle,
        mode: UpdateMode,
    ) -> Result<bool, updater::Error> {
        self.last_update_check = SystemTime::now();

        let update_mode = get_update_mode_str(mode);
        let enabled = !is_dev();
        info!(
            "Checking for updates mode={} enabled={}",
            update_mode, enabled
        );

        if !enabled {
            return Ok(false);
        }

        match app_handle
            .updater()
            .header("X-Update-Mode", update_mode)?
            .check()
            .await
        {
            Ok(update) => {
                let h = app_handle.clone();
                dialog::ask(
                    None::<&Window>,
                    "Update Available",
                    format!(
                        "{} is available. Would you like to download and install it now?",
                        update.latest_version()
                    ),
                    |confirmed| {
                        if !confirmed {
                            return;
                        }
                        tauri::async_runtime::spawn(async move {
                            match update.download_and_install().await {
                                Ok(_) => {
                                    if dialog::blocking::ask(
                                        None::<&Window>,
                                        "Update Installed",
                                        "Would you like to restart the app?",
                                    ) {
                                        h.restart();
                                    }
                                }
                                Err(e) => {
                                    dialog::message(
                                        None::<&Window>,
                                        "Update Failed",
                                        format!("The update failed to install: {}", e),
                                    );
                                }
                            }
                        });
                    },
                );
                Ok(true)
            }
            Err(updater::Error::UpToDate) => Ok(false),
            Err(e) => Err(e),
        }
    }
    pub async fn check(
        &mut self,
        app_handle: &AppHandle,
        mode: UpdateMode,
    ) -> Result<bool, updater::Error> {
        let ignore_check =
            self.last_update_check.elapsed().unwrap().as_secs() < MAX_UPDATE_CHECK_SECONDS;
        if ignore_check {
            return Ok(false);
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
