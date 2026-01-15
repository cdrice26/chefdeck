use crate::{AppState, errors::StringifyError, token_keyring};
use serde::Deserialize;
use tauri::State;
use crate::api::{ErrorResponse, SuccessResponse};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Tokens {
    access_token: String,
    refresh_token: String
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginResponse {
    data: Tokens
}

#[tauri::command]
pub async fn api_auth_login(state: State<'_, AppState>, email: String, password: String) -> Result<SuccessResponse, ErrorResponse> {
    let client = reqwest::Client::new();
    let response = client.post(format!("{}/auth/login", std::env::var("API_URL").unwrap_or_default()))
        .json(&serde_json::json!({
            "email": email,
            "password": password
        }))
        .send()
        .await.string_err()?;

    if response.status().is_success() {
        let rjson: LoginResponse = response.json().await.string_err()?;
        let mut access_token_mutex = state.access_token.lock().await;
        *access_token_mutex = Some(rjson.data.access_token);
        token_keyring::store_refresh_token(rjson.data.refresh_token.as_str()).string_err()?;
        Ok(SuccessResponse::new("Login successful".to_string()))
    } else {
        Err(ErrorResponse::new("Login failed".to_string()))
    }
}
