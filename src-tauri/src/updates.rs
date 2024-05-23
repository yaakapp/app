use std::fmt::{Display, Formatter};
use std::time::SystemTime;

use log::info;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

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

impl Display for UpdateMode {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            UpdateMode::Stable => "stable",
            UpdateMode::Beta => "beta",
        };
        write!(f, "{}", s)
    }
}

impl UpdateMode {
    pub fn new(mode: &str) -> UpdateMode {
        match mode {
            "beta" => UpdateMode::Beta,
            _ => UpdateMode::Stable,
        }
    }
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
    ) -> Result<bool, tauri_plugin_updater::Error> {
        self.last_update_check = SystemTime::now();

        info!("Checking for updates mode={}", mode);

        let update_check_result = app_handle
            .updater_builder()
            .header("X-Update-Mode", mode.to_string())?
            .build()?
            .check()
            .await;

        match update_check_result
        {
            Ok(Some(update)) => {
                let h = app_handle.clone();
                app_handle
                    .dialog()
                    .message(format!(
                        "{} is available. Would you like to download and install it now?",
                        update.version
                    ))
                    .ok_button_label("Download")
                    .cancel_button_label("Later")
                    .title("Update Available")
                    .show(|confirmed| {
                        if !confirmed {
                            return;
                        }
                        tauri::async_runtime::spawn(async move {
                            match update.download_and_install(|_, _| {}, || {}).await {
                                Ok(_) => {
                                    if h.dialog()
                                        .message("Would you like to restart the app?")
                                        .title("Update Installed")
                                        .ok_button_label("Restart")
                                        .cancel_button_label("Later")
                                        .blocking_show()
                                    {
                                        h.restart();
                                    }
                                }
                                Err(e) => {
                                    h.dialog()
                                        .message(format!("The update failed to install: {}", e));
                                }
                            }
                        });
                    });
                Ok(true)
            }
            Ok(None) => Ok(false),
            Err(e) => Err(e),
        }
    }
    pub async fn check(
        &mut self,
        app_handle: &AppHandle,
        mode: UpdateMode,
    ) -> Result<bool, tauri_plugin_updater::Error> {
        let ignore_check =
            self.last_update_check.elapsed().unwrap().as_secs() < MAX_UPDATE_CHECK_SECONDS;
        if ignore_check {
            return Ok(false);
        }

        // Don't check if dev
        if is_dev() {
            return Ok(false);
        }

        self.force_check(app_handle, mode).await
    }
}
