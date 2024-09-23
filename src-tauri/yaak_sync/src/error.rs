use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("JSON error: {0}")]
    JsonErr(#[from] serde_json::Error),
    
    #[error("Yaak model error: {0}")]
    ModelErr(#[from] yaak_models::error::Error),
}

#[allow(unused)]
pub type Result<T> = std::result::Result<T, Error>;
