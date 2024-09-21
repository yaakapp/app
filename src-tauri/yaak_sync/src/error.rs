use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("JSON error: {0}")]
    JsonErr(#[from] serde_json::Error),
}

#[allow(unused)]
pub type Result<T> = std::result::Result<T, Error>;
