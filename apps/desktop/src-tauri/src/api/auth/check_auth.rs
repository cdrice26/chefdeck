use reqwest::Response;
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::{token_keyring::{get_refresh_token, store_refresh_token}, AppState};
use crate::errors::StringifyError;
use crate::api::GenericResponse;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RefreshTokenResponse {
    access_token: String,
    refresh_token: String
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Profile {
    pub username: String
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CheckAuthResponse {
    pub profile: Profile
}

async fn refresh_access_token(state: &State<'_, AppState>) -> Result<(), String> {
    let refresh_token = get_refresh_token().string_err()?.expect("Refresh token not found");
    let client = reqwest::Client::new();
    let response = client.post(format!("{}/auth/refreshToken", std::env::var("API_URL").unwrap_or_default()))
        .header("x-refresh-token", refresh_token)
        .send()
        .await.string_err()?;

    if response.status().is_success() {
        let new_tokens: RefreshTokenResponse = response.json().await.string_err()?;

        let mut access_token = state.access_token.lock().await;
        *access_token = Some(new_tokens.access_token);
        store_refresh_token(new_tokens.refresh_token.as_str()).string_err()?;
        Ok(())
    } else {
        Err("Failed to refresh access token".to_string())
    }
}

async fn make_auth_request(access_token: &str) -> Result<Response, String> {
    let client = reqwest::Client::new();
    client.get(format!("{}/auth/checkAuth", std::env::var("API_URL").unwrap_or_default()))
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await.string_err()
}

async fn parse_response(response: Response) -> Result<GenericResponse<CheckAuthResponse>, String> {
    let data: GenericResponse<CheckAuthResponse> = response.json().await.string_err()?;
    Ok(data)
}

#[tauri::command]
pub async fn api_auth_check_auth(state: State<'_, AppState>) -> Result<GenericResponse<CheckAuthResponse>, String> {
    // PHASE 1: Check if we need to refresh before making the request
    let needs_refresh = {
        let access_token = state.access_token.lock().await;
        access_token.is_none()
    };

    if needs_refresh {
        refresh_access_token(&state).await?;
    }

    // PHASE 2: Read the (possibly refreshed) token
    let token = {
        let access_token = state.access_token.lock().await;
        access_token.clone().ok_or("Not logged in".to_string())?
    };

    // PHASE 3: Make the authenticated request
    let mut response = make_auth_request(&token).await?;

    // PHASE 4: If unauthorized, try refreshing once
    if response.status().is_client_error() {
        refresh_access_token(&state).await?;

        // Read the updated token
        let token = {
            let access_token = state.access_token.lock().await;
            access_token.clone().ok_or("Not logged in".to_string())?
        };

        response = make_auth_request(&token).await?;
    }

    // PHASE 5: Final response handling
    if response.status().is_success() {
        parse_response(response).await
    } else {
        Err("Not authenticated".to_string())
    }
}
