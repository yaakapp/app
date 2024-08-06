use thiserror::Error;
use tokio::io;
use tokio::sync::mpsc::error::SendError;
use crate::server::plugin_runtime::EventStreamEvent;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error")]
    IoErr(#[from] io::Error),
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
    #[error("Missing callback error")]
    UnknownErr,
}

pub type Result<T> = std::result::Result<T, Error>;
