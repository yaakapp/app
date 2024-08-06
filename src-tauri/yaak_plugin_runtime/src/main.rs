use yaak_plugin_runtime::start_server;

mod server;
mod events;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    start_server().await
}
