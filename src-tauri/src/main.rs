mod commands;
mod runtime;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::send_request,
            commands::greet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
