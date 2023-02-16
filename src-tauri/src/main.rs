#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use deno_core::JsRuntime;
use deno_core::RuntimeOptions;

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
    url: String,
}

fn run_plugin() {
    // Initialize a runtime instance
    let mut runtime = JsRuntime::new(RuntimeOptions {
        ..Default::default()
    });

    runtime
        .execute_script("deno", "Deno.core.print('Hello from Deno!\\n')")
        .unwrap();
}

#[tauri::command]
async fn send_request(url: &str) -> Result<CustomResponse, String> {
    run_plugin();
    let start = std::time::Instant::now();

    let mut abs_url = url.to_string();
    if !abs_url.starts_with("http://") && !abs_url.starts_with("https://") {
        abs_url = format!("http://{}", url);
    }

    let resp = reqwest::get(abs_url.to_string()).await;
    let elapsed = start.elapsed().as_millis();

    match resp {
        Ok(v) => {
            let url2 = v.url().to_string();
            let status = v.status().to_string();
            let body = v.text().await.unwrap();
            let elapsed2 = start.elapsed().as_millis();
            Ok(CustomResponse {
                status,
                body,
                elapsed,
                elapsed2,
                url: url2,
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
