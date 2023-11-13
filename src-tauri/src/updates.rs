use std::time::SystemTime;

use tauri::{AppHandle, updater, Window, Wry};
use tauri::api::dialog;

// Check for updates every 3 hours
const MAX_UPDATE_CHECK_SECONDS: u64 = 3600 * 3;

// Create updater struct
pub struct YaakUpdater {
    last_update_check: SystemTime,
}

impl YaakUpdater {
    pub fn new() -> Self {
        Self {
            last_update_check: SystemTime::UNIX_EPOCH,
        }
    }
    pub async fn check(&mut self, app_handle: &AppHandle<Wry>) -> Result<(), updater::Error> {
        if self.last_update_check.elapsed().unwrap().as_secs() < MAX_UPDATE_CHECK_SECONDS {
            return Ok(());
        }

        self.last_update_check = SystemTime::now();
        match app_handle.updater().check().await {
            Ok(update) => {
                if dialog::blocking::ask(
                    None::<&Window>,
                    "Update available",
                    "An update is available. Would you like to download and install it now?",
                ) {
                    _ = update.download_and_install().await;
                }
                Ok(())
            }
            Err(updater::Error::UpToDate) => Ok(()),
            Err(e) => Err(e),
        }
    }
}
