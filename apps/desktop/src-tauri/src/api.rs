pub mod recipe;
pub mod recipes;
pub mod auth;

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct GenericResponse<T> {
    pub data: T
}

#[derive(Serialize)]
pub struct SuccessResponse {
    pub message: String
}

impl SuccessResponse {
    pub fn new(message: String) -> Self {
        Self { message }
    }
}

impl From<String> for SuccessResponse {
    fn from(message: String) -> Self {
        Self { message }
    }
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String
}

impl ErrorResponse {
    pub fn new(error: String) -> Self {
        Self { error }
    }
}

impl From<String> for ErrorResponse {
    fn from(error: String) -> Self {
        Self { error }
    }
}
