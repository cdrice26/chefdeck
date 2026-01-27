use crate::errors::StringifyError;
use crate::token_keyring::{get_refresh_token, store_refresh_token};
use crate::types::cloud_structs::RecipeFormData;
use crate::AppState;
use reqwest::{Response, StatusCode};
use serde::Deserialize;
use tauri::{AppHandle, Manager, State};

/// Response shape returned by the refresh token endpoint.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RefreshTokenResponse {
    access_token: String,
    refresh_token: String,
}

/// Refresh the access token using the stored refresh token and update `state`.
pub async fn refresh_access_token(state: &State<'_, AppState>) -> Result<(), String> {
    let refresh_token = get_refresh_token()
        .string_err()?
        .ok_or("Refresh token not found")?;
    let client = reqwest::Client::new();
    let response = client
        .post(format!(
            "{}/auth/refreshToken",
            std::env::var("API_URL").unwrap_or_default()
        ))
        .header("x-refresh-token", refresh_token)
        .send()
        .await
        .string_err()?;

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

/// Internal helper to send a DELETE request with the current access token (if any).
async fn do_delete_request(
    state: &State<'_, AppState>,
    client: &reqwest::Client,
    endpoint: &str,
) -> Result<Response, String> {
    let api_url = std::env::var("API_URL").unwrap_or_default();
    let access_token_guard = state.access_token.lock().await;
    let token = access_token_guard.as_deref().unwrap_or("");

    let req = client.delete(format!("{}{}", api_url, endpoint));
    let req = if token.is_empty() {
        req
    } else {
        req.header("Authorization", format!("Bearer {}", token))
    };

    req.send().await.string_err()
}

/// Public GET wrapper: tries once, if unauthorized attempts to refresh token and retries.
pub async fn get(app: &AppHandle, endpoint: &str) -> Result<Response, String> {
    let state: State<AppState> = app.state();
    let client = reqwest::Client::new();
    let mut resp = do_get_request(&state, &client, endpoint).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(&state).await?;
        resp = do_get_request(&state, &client, endpoint).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else if resp.status() == StatusCode::OK {
        Ok(resp)
    } else {
        Err(format!("Unexpected status code: {}", resp.status()))
    }
}

/// Public POST wrapper: tries once, if unauthorized attempts to refresh token and retries.
pub async fn post(app: &AppHandle, endpoint: &str, body: &str) -> Result<Response, String> {
    let state: State<AppState> = app.state();
    let client = reqwest::Client::new();
    let mut resp = do_post_request(&state, &client, endpoint, body).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(&state).await?;
        resp = do_post_request(&state, &client, endpoint, body).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else if resp.status() == StatusCode::OK {
        Ok(resp)
    } else {
        Err(format!("Unexpected status code: {}", resp.status()))
    }
}

/// Public DELETE wrapper: tries once, if unauthorized attempts to refresh token and retries.
pub async fn delete(app: &AppHandle, endpoint: &str) -> Result<Response, String> {
    let state: State<AppState> = app.state();
    let client = reqwest::Client::new();
    let mut resp = do_delete_request(&state, &client, endpoint).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(&state).await?;
        resp = do_delete_request(&state, &client, endpoint).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else if resp.status() == StatusCode::OK {
        Ok(resp)
    } else {
        Err(format!("Unexpected status code: {}", resp.status()))
    }
}

/// Internal recipe post request function.
pub async fn do_recipe_post_request(
    state: &State<'_, AppState>,
    client: &reqwest::Client,
    endpoint: &str,
    recipe: &RecipeFormData,
) -> Result<Response, String> {
    let api_url = std::env::var("API_URL").unwrap_or_default();
    let access_token_guard = state.access_token.lock().await;
    let token = access_token_guard.as_deref().unwrap_or("");

    let mut form = reqwest::multipart::Form::new()
        .text("title", recipe.title.clone())
        .text("yield", recipe.yield_value.to_string())
        .text("time", recipe.time.to_string())
        .text("color", recipe.color.clone());

    for tag_id in recipe.tags.iter() {
        form = form.text("tags[]", tag_id.to_string());
    }

    for ingredient in recipe.ingredients.iter() {
        form = form.text("ingredientNames", ingredient.name.clone());
        form = form.text("ingredientAmounts", ingredient.amount.to_string());
        form = form.text("ingredientUnits", ingredient.unit.clone());
    }

    for step in recipe.directions.iter() {
        form = form.text("directions", step.clone());
    }

    if let Some(source_url) = &recipe.source_url {
        form = form.text("sourceUrl", source_url.clone());
    }

    if let Some(path) = &recipe.image_path {
        // Read file bytes
        let bytes = tokio::fs::read(path).await.string_err()?;

        // Detect MIME type automatically
        let mime = infer::get(&bytes)
            .map(|t| t.mime_type())
            .unwrap_or("application/octet-stream");

        // Extract filename from the path
        let filename = std::path::Path::new(path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("file")
            .to_owned();

        // Build multipart part
        let part = reqwest::multipart::Part::bytes(bytes)
            .file_name(filename)
            .mime_str(mime)
            .string_err()?;

        form = form.part("image", part);
    }

    let req = client.post(format!("{}{}", api_url, endpoint));
    let req = if token.is_empty() {
        req
    } else {
        req.header("Authorization", format!("Bearer {}", token))
    };

    req.multipart(form).send().await.string_err()
}

/// Public recipe POST wrapper: tries once, if unauthorized attempts to refresh token and retries.
pub async fn recipe_post(
    app: &AppHandle,
    endpoint: &str,
    recipe: RecipeFormData,
) -> Result<Response, String> {
    let state: State<AppState> = app.state();

    let client = reqwest::Client::new();
    let mut resp = do_recipe_post_request(&state, &client, endpoint, &recipe).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(&state).await?;
        resp = do_recipe_post_request(&state, &client, endpoint, &recipe).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else {
        Ok(resp)
    }
}
