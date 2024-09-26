const COMMANDS: &[&str] = &["diff"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
