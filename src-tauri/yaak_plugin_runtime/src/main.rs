use yaak_plugin_runtime::start_server;

mod server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    start_server().await
}
