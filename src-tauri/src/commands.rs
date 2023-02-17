#[derive(serde::Serialize)]
pub struct CustomResponse {
    status: String,
    body: String,
    elapsed: u128,
    elapsed2: u128,
    url: String,
}

#[tauri::command]
pub async fn send_request(url: &str) -> Result<CustomResponse, String> {
    let start = std::time::Instant::now();

    let mut abs_url = url.to_string();
    if !abs_url.starts_with("http://") && !abs_url.starts_with("https://") {
        abs_url = format!("http://{}", url);
    }

    let resp = reqwest::get(abs_url.to_string()).await;
    let elapsed = start.elapsed().as_millis();

    crate::runtime::run_plugin_sync("../plugins/plugin.ts").unwrap();

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

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
