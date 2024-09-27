const COMMANDS: &[&str] = &["changes", "commit"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
