use crate::api::sync_data::sync_all;
use crate::api::{ErrorResponse, SuccessResponse};
use crate::{errors::StringifyError, token_keyring, AppState};
use serde::Deserialize;
use tauri::{AppHandle, Emitter, State};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Tokens {
    access_token: String,
    refresh_token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginResponse {
    data: Tokens,
}

#[tauri::command]
pub async fn api_auth_login(
    app: AppHandle,
    state: State<'_, AppState>,
    email: String,
    password: String,
) -> Result<SuccessResponse, ErrorResponse> {
    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/auth/login", env!("API_URL")))
        .json(&serde_json::json!({
            "email": email,
            "password": password
        }))
        .send()
        .await
        .string_err()?;

    if response.status().is_success() {
        let rjson: LoginResponse = response.json().await.string_err()?;
        let mut access_token_mutex = state.access_token.lock().await;
        *access_token_mutex = Some(rjson.data.access_token);
        token_keyring::store_refresh_token(rjson.data.refresh_token.as_str()).string_err()?;
        tauri::async_runtime::spawn(async move {
            match sync_all(app.clone()).await {
                Ok(_) => app.emit("sync_success", "Sync complete!"),
                Err(_) => app.emit("sync_error", "Failed to sync data"),
            }
        });
        Ok(SuccessResponse::new("Login successful".to_string()))
    } else {
        Err(ErrorResponse::new("Login failed".to_string()))
    }
}
