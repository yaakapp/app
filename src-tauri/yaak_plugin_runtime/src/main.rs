use std::env;
use std::fs::read_dir;
use yaak_plugin_runtime::plugin::start_server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let dir = env::var("YAAK_PLUGINS_DIR").expect("YAAK_PLUGINS_DIR not set");

    let plugin_dirs: Vec<String> = match read_dir(dir) {
        Ok(result) => {
            let mut dirs: Vec<String> = vec![];
            for entry_result in result {
                match entry_result {
                    Ok(entry) => {
                        if entry.path().is_dir() {
                            dirs.push(entry.path().to_string_lossy().to_string())
                        }
                    }
                    Err(_) => {
                        continue;
                    }
                }
            };
            dirs
        }
        Err(_) => vec![],
    };
    start_server(plugin_dirs).await.unwrap();
    Ok(())
}
