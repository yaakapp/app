use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("SQL error: {0}")]
    SqlError(#[from] rusqlite::Error),
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("unknown error")]
    Unknown,
}

pub type Result<T> = std::result::Result<T, Error>;