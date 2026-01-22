use crate::{api::GenericResponse, errors::StringifyError};
use crate::macros::run_tx;
use crate::types::response_bodies::Ingredient;
use crate::AppState;
use crate::request::refresh_access_token;
use crate::types::cloud_structs::RecipeFormData;
use image::{imageops, ImageReader};
use sqlx::{Sqlite, Transaction};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, State, Emitter};
use uuid::Uuid;
use reqwest::{StatusCode, Response};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NewRecipeResponse {
    pub recipe_id: String,
}

fn process_image(image: Option<&str>, new_location: &PathBuf) {
    // If no image path is provided, exit early
    let image_path = match image {
        Some(path) => path,
        None => return,
    };

    // Try to open the image, return early if it fails
    let reader = match ImageReader::open(image_path) {
        Ok(reader) => reader,
        Err(err) => {
            eprintln!("Error opening image: {}", err);
            return;
        }
    };

    // Try to decode the image
    let decoded = match reader.decode() {
        Ok(img) => img,
        Err(err) => {
            eprintln!("Error decoding image: {}", err);
            return;
        }
    };

    // Ensure parent directory exists (create recursively if needed)
    if let Some(parent) = new_location.parent() {
        if let Err(err) = fs::create_dir_all(parent) {
            eprintln!("Failed to create directories {:?}: {}", parent, err);
            return;
        }
    }

    // Resize and save
    let resized = decoded.resize(1000, 1000, imageops::FilterType::Lanczos3);
    if let Err(err) = resized.save(new_location) {
        eprintln!("Error saving image: {}", err);
    }
}

async fn insert_recipe_data(
    tx: &mut Transaction<'_, Sqlite>,
    title: &String,
    yield_value: &u32,
    time: &u32,
    image_path: &Option<String>,
    color: &String,
    ingredients: &Vec<Ingredient>,
    directions: &Vec<String>,
    tags: &Vec<String>,
    source_url: &Option<String>,
) -> Result<i64, sqlx::Error> {
    // Insert recipe
    let row = sqlx::query_file!(
        "db/insert_recipe.sql",
        title,
        yield_value,
        time,
        image_path,
        color,
        source_url
    )
    .fetch_one(&mut **tx)
    .await?;

    let recipe_id: i64 = row.id;

    // Insert ingredients
    for (i, ingredient) in ingredients.iter().enumerate() {
        let sequence = (i + 1) as i64;
        sqlx::query_file!(
            "db/insert_ingredient.sql",
            recipe_id,
            recipe_id,
            ingredient.name,
            ingredient.amount,
            ingredient.unit,
            sequence
        )
        .fetch_one(&mut **tx)
        .await?;
    }

    // Insert directions
    for (i, direction) in directions.iter().enumerate() {
        let sequence = (i + 1) as i64;
        sqlx::query_file!(
            "db/insert_direction.sql",
            recipe_id,
            recipe_id,
            direction,
            sequence
        )
        .fetch_one(&mut **tx)
        .await?;
    }

    let mut tag_ids: Vec<i64> = Vec::new();

    // Make sure user has all tags defined and get tag IDs
    for tag in tags.iter() {
        let tag_id = sqlx::query_file!("db/insert_user_tag.sql", tag)
            .fetch_one(&mut **tx)
            .await?;
        tag_ids.push(tag_id.id);
    }

    // Insert into recipe tags table
    for tag_id in tag_ids.iter() {
        sqlx::query_file!("db/insert_recipe_tags.sql", recipe_id, recipe_id, tag_id)
            .fetch_one(&mut **tx)
            .await?;
    }

    // Insert recipe usage record
    sqlx::query_file!("db/insert_recipe_usage.sql", recipe_id)
        .fetch_one(&mut **tx)
        .await?;

    Ok(recipe_id)
}

async fn update_cloud_parent_id(tx: &mut Transaction<'_, Sqlite>, recipe_id: i64, online_recipe_id: &str) -> Result<(), sqlx::Error> {
    sqlx::query_file!("db/update_cloud_parent_id.sql", online_recipe_id, recipe_id)
        .execute(&mut **tx)
        .await?;
    Ok(())
}

async fn do_post_request(
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
            .mime_str(mime).string_err()?;

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

async fn post(app: &AppHandle, endpoint: &str, recipe: RecipeFormData) -> Result<Response, String> {
    let state: State<AppState> = app.state();

    let client = reqwest::Client::new();
    let mut resp = do_post_request(&state, &client, endpoint, &recipe).await?;

    if resp.status() == StatusCode::UNAUTHORIZED {
        // Try to refresh and retry once
        refresh_access_token(&state).await?;
        resp = do_post_request(&state, &client, endpoint, &recipe).await?;
        if resp.status() == StatusCode::UNAUTHORIZED {
            Err("Failed to refresh access token".to_string())
        } else {
            Ok(resp)
        }
    } else {
        Ok(resp)
    }
}

async fn add_to_cloud(app: &AppHandle, recipe_id: i64, recipe: RecipeFormData) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = &state.db;
    let resp = post(&app, "/recipe/new", recipe).await;
    match resp {
        Ok(resp) => {
            let resp_data: GenericResponse<NewRecipeResponse> = resp.json().await.string_err()?;
            let online_recipe_id = resp_data.data.recipe_id;
            let update_resp = run_tx!(db, |tx| update_cloud_parent_id(tx, recipe_id, online_recipe_id.as_str()));
            if update_resp.is_err() {
                Err(update_resp.err().unwrap().to_string())
            } else {
                Ok(())
            }
        }
        Err(_) => {
            Err(String::from("Failed to add recipe to cloud"))
        }
    }
}

#[tauri::command]
pub async fn api_recipe_new(
    state: State<'_, AppState>,
    app: AppHandle,
    title: String,
    ingredients: Vec<Ingredient>,
    yield_value: u32,
    time: u32,
    image: Option<String>,
    directions: Vec<String>,
    tags: Vec<String>,
    color: String,
    source_url: Option<String>,
) -> Result<i64, String> {
    let db = &state.db;

    let image_path = if let Some(image) = image {
        let image_path_obj = app
            .path()
            .app_data_dir()
            .unwrap()
            .join("images")
            .join(Uuid::new_v4().to_string() + ".jpg");
        process_image(Some(&image), &image_path_obj);
        Some(image_path_obj.to_string_lossy().into_owned())
    } else {
        None
    };

    let recipe_id = run_tx!(db, |tx| insert_recipe_data(
        tx,
        &title,
        &yield_value,
        &time,
        &image_path,
        &color,
        &ingredients,
        &directions,
        &tags,
        &source_url
    ));

    let should_request = {
        let access_token_mutex = state.access_token.lock().await;
        if let Some(_) = access_token_mutex.as_ref() {
            true
        } else {
            false
        }
    };

    if should_request {
        if let Ok(recipe_id) = recipe_id {
        tauri::async_runtime::spawn(async move {
            let cloud_result = add_to_cloud(&app, recipe_id, RecipeFormData {
                title,
                yield_value,
                time,
                image_path,
                color,
                ingredients,
                directions,
                tags,
                source_url
            }).await;
            if let Err(_) = cloud_result {
                let _ = app.emit("new_recipe_cloud_error", "Failed to add recipe to cloud");
            }
        });}
    }

    recipe_id
}
