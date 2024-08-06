use yaak_plugin_runtime::plugin::start_server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    start_server().await.unwrap();
    Ok(())
}
