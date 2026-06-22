pub mod archive;
pub mod auth;
pub mod recipe;
pub mod recipes;
pub mod sync_data;
pub mod tags;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;

use crate::AppState;

/// Represents a generic API response with a data field.
#[derive(Debug, Serialize, Deserialize)]
pub struct GenericResponse<T> {
    pub data: T,
}

/// Represents a successful API response with a message.
#[derive(Serialize)]
pub struct SuccessResponse {
    pub message: String,
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
    pub error: String,
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

/// Determines whether or not a local action should be duplicated in the cloud.
///
/// # Arguments
/// * `state` - A reference to the application state.
///
/// # Returns
/// * `bool` - `true` if user is authenticated, `false` otherwise.
pub async fn should_request(state: &State<'_, AppState>) -> bool {
    let access_token_mutex = state.access_token.lock().await;
    if let Some(_) = access_token_mutex.as_ref() {
        true
    } else {
        false
    }
}

/// Opens the given URL in the default browser.
///
/// # Arguments
/// * `url` - The URL to open.
#[tauri::command]
pub async fn open_url(app: AppHandle, url: &str) -> Result<(), String> {
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())?;
    Ok(())
}
