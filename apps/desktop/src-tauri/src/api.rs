pub mod auth;
pub mod recipe;
pub mod recipes;
pub mod sync_data;

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{types::response_bodies::CloudId, AppState};

/// Represents a generic API response with a data field.
#[derive(Serialize, Deserialize)]
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

/// Gets local image path for upload to cloud
///
/// Arguments:
/// * `state` - A reference to the application state.
/// * `image_path` - The name of the image file.
///
/// Returns:
/// * `String` - The path to the image in the cloud.
pub async fn get_cloud_image_path(
    state: &State<'_, AppState>,
    image_path: &Option<String>,
) -> Option<String> {
    match &image_path {
        Some(image_path) => Some(
            state
                .images_lib_path
                .join(image_path)
                .to_string_lossy()
                .to_string(),
        ),
        None => None,
    }
}

/// Gets cloud recipe ID
///
/// Arguments:
/// * `tx` - A mutable reference to the database transaction.
/// * `id` - The ID of the recipe.
///
/// Returns:
/// * `Result<String, sqlx::Error>` - The cloud recipe ID or an error.
pub async fn get_cloud_id(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    id: i64,
) -> Result<String, sqlx::Error> {
    let cloud_id = sqlx::query_file_as!(CloudId, "db/get_cloud_id.sql", id)
        .fetch_one(&mut **tx)
        .await?;
    Ok(cloud_id.cloud_recipe_id)
}
