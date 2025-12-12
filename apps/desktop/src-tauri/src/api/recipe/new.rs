use std::path::PathBuf;
use sqlx::{Sqlite, Transaction};
use tauri::{AppHandle, State, Manager};
use image::{ImageReader, imageops};
use uuid::Uuid;
use serde::Deserialize;
use std::fs;
use crate::AppState;
use crate::errors::StringifySqlxError;

#[derive(Deserialize)]
pub struct Ingredient {
    pub name: String,
    pub amount: u32,
    pub unit: String,
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
    title: String,
    yield_value: u32,
    time: u32,
    image_path: Option<String>,
    color: String,
    ingredients: Vec<Ingredient>,
    directions: Vec<String>,
    tags: Vec<String>,
    source_url: Option<String>
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
        let tag_id = sqlx::query_file!(
            "db/insert_user_tag.sql",
            tag
        )
        .fetch_one(&mut **tx)
        .await?;
        tag_ids.push(tag_id.id);
    }

    // Insert into recipe tags table
    for tag_id in tag_ids.iter() {
        sqlx::query_file!(
            "db/insert_recipe_tags.sql",
            recipe_id,
            recipe_id,
            tag_id
        )
        .fetch_one(&mut **tx)
        .await?;
    }

    Ok(recipe_id)
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

    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    let recipe_id = insert_recipe_data(
        &mut tx,
        title,
        yield_value,
        time,
        image_path,
        color,
        ingredients,
        directions,
        tags,
        source_url
    )
    .await.string_err();

    let commit_result = tx.commit().await.string_err();

    match commit_result {
        Ok(_) => recipe_id,
        Err(e) => Err(e),
    }
}
