use crate::{AppState, errors::StringifyError, api::{SuccessResponse, ErrorResponse}, token_keyring::clear_refresh_token};
use tauri::State;

#[tauri::command]
pub async fn api_auth_logout(state: State<'_, AppState>) -> Result<SuccessResponse, ErrorResponse> {
    let mut access_token_mutex = state.access_token.lock().await;
    *access_token_mutex = None;
    clear_refresh_token().string_err()?;
    Ok(SuccessResponse::new("Logout successful".to_string()))
}
