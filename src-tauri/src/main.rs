#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(serde::Serialize)]
struct CustomResponse {
    status: String,
    body: String,
    elapsed: u128,
    elapsed2: u128,
}

#[tauri::command]
async fn send_request(url: &str) -> Result<CustomResponse, String> {
    let start = std::time::Instant::now();

    let mut url = url.to_string();
    if !url.starts_with("http://") && !url.starts_with("https://") {
        url = format!("http://{}", url);
    }

    let resp = reqwest::get(url).await;
    let elapsed = start.elapsed().as_millis();

    match resp {
        Ok(v) => {
            let status = v.status().to_string();
            let body = v.text().await.unwrap();
            let elapsed2 = start.elapsed().as_millis();
            Ok(CustomResponse {
                status,
                body,
                elapsed,
                elapsed2,
            })
        }
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_request, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
