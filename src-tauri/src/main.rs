#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn send_request(url: &str) -> Result<String, String> {
    let mut url = url.to_string();
    if !url.starts_with("http://") && !url.starts_with("https://") {
        url = format!("http://{}", url);
    }

    let resp = reqwest::get(url).await;
    match resp {
        Ok(v) => Ok(v.text().await.unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_request, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
