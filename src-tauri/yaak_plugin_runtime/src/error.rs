use thiserror::Error;
use tokio::io;
use tokio::sync::mpsc::error::SendError;
use crate::server::plugin_runtime::EventStreamEvent;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error")]
    IoErr(#[from] io::Error),
    #[error("Tauri error")]
    TauriErr(#[from] tauri::Error),
    #[error("Tauri shell error")]
    TauriShellErr(#[from] tauri_plugin_shell::Error),
    #[error("Grpc transport error")]
    GrpcTransportErr(#[from] tonic::transport::Error),
    #[error("Grpc send error")]
    GrpcSendErr(#[from] SendError<tonic::Result<EventStreamEvent>>),
    #[error("JSON error")]
    JsonErr(#[from] serde_json::Error),
    #[error("Plugin not found: {0}")]
    PluginNotFoundErr(String),
    #[error("Plugin error: {0}")]
    PluginErr(String),
}

impl Into<String> for Error {
    fn into(self) -> String {
        todo!()
    }
}

pub type Result<T> = std::result::Result<T, Error>;
