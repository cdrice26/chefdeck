use tauri::State;
use reqwest::{StatusCode, Response};
use serde::Deserialize;
use crate::AppState;
use crate::token_keyring::{get_refresh_token, store_refresh_token};
use crate::errors::StringifyError;

/// Response shape returned by the refresh token endpoint.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RefreshTokenResponse {
    access_token: String,
    refresh_token: String,
}

/// Refresh the access token using the stored refresh token and update `state`.
pub async fn refresh_access_token(state: &State<'_, AppState>) -> Result<(), String> {
    let refresh_token = get_refresh_token().string_err()?.ok_or("Refresh token not found")?;
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

/// Internal helper to send a GET request with the current access token (if any).
async fn do_get_request(
    state: &State<'_, AppState>,
    client: &reqwest::Client,
    endpoint: &str,
) -> Result<Response, String> {
    let api_url = std::env::var("API_URL").unwrap_or_default();
    let access_token_guard = state.access_token.lock().await;
    let token = access_token_guard.as_deref().unwrap_or("");

    let req = client.get(format!("{}{}", api_url, endpoint));
    let req = if token.is_empty() {
        req
    } else {
        req.header("Authorization", format!("Bearer {}", token))
    };

    req.send().await.string_err()
}

/// Internal helper to send a POST request with the current access token (if any).
async fn do_post_request(
    state: &State<'_, AppState>,
    client: &reqwest::Client,
    endpoint: &str,
    body: &str,
) -> Result<Response, String> {
    let api_url = std::env::var("API_URL").unwrap_or_default();
    let access_token_guard = state.access_token.lock().await;
    let token = access_token_guard.as_deref().unwrap_or("");

    let req = client.post(format!("{}{}", api_url, endpoint));
    let req = if token.is_empty() {
        req
    } else {
        req.header("Authorization", format!("Bearer {}", token))
    };

    req.body(body.to_string()).send().await.string_err()
}

/// Public GET wrapper: tries once, if unauthorized attempts to refresh token and retries.
pub async fn get(state: &State<'_, AppState>, endpoint: &str) -> Result<Response, String> {
    let client = reqwest::Client::new();
    let mut resp = do_get_request(state, &client, endpoint).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(state).await?;
        resp = do_get_request(state, &client, endpoint).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else {
        Ok(resp)
    }
}

/// Public POST wrapper: tries once, if unauthorized attempts to refresh token and retries.
pub async fn post(state: &State<'_, AppState>, endpoint: &str, body: &str) -> Result<Response, String> {
    let client = reqwest::Client::new();
    let mut resp = do_post_request(state, &client, endpoint, body).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(state).await?;
        resp = do_post_request(state, &client, endpoint, body).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else {
        Ok(resp)
    }
}
