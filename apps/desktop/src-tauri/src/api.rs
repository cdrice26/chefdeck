pub mod recipe;
pub mod recipes;
pub mod auth;
pub mod sync_data;

use serde::{Serialize, Deserialize};

/// Represents a generic API response with a data field.
#[derive(Serialize, Deserialize)]
pub struct GenericResponse<T> {
    pub data: T
}

/// Represents a successful API response with a message.
#[derive(Serialize)]
pub struct SuccessResponse {
    pub message: String
}

impl SuccessResponse {
    /// Creates a new `SuccessResponse` with the given message.
    pub fn new(message: String) -> Self {
        Self { message }
    }
}

impl From<String> for SuccessResponse {
    /// Creates a new `SuccessResponse` from a string message.
    fn from(message: String) -> Self {
        Self { message }
    }
}

/// Represents an error API response with an error message.
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String
}

impl ErrorResponse {
    /// Creates a new `ErrorResponse` with the given error message.
    pub fn new(error: String) -> Self {
        Self { error }
    }
}

impl From<String> for ErrorResponse {
    /// Creates a new `ErrorResponse` from a string error message.
    fn from(error: String) -> Self {
        Self { error }
    }
}
