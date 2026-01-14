pub mod recipe;
pub mod recipes;
pub mod auth;

use serde::Serialize;

#[derive(Serialize)]
pub struct SuccessResponse {
    pub message: String
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


impl From<String> for ErrorResponse {
    fn from(error: String) -> Self {
        Self { error }
    }
}
