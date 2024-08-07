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
    #[error("Unknown plugin error")]
    UnknownPluginErr(String),
    #[error("unknown error")]
    MissingCallbackIdErr(String),
    #[error("Missing callback ID error")]
    MissingCallbackErr(String),
    #[error("No plugins found")]
    NoPluginsErr(String),
    #[error("Missing callback error")]
    UnknownErr,
}

impl Into<String> for Error {
    fn into(self) -> String {
        todo!()
    }
}

pub type Result<T> = std::result::Result<T, Error>;
