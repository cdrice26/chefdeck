use sqlx::{Pool, Sqlite, Transaction};
use tauri::{AppHandle, State};

use crate::{errors::StringifyError, macros::run_tx, types::response_bodies::Ingredient, AppState};

use super::new::{get_processed_image, insert_related_data};

async fn update_recipe_data(
    tx: &mut Transaction<'_, Sqlite>,
    id: &i64,
    title: &String,
    ingredients: &Vec<Ingredient>,
    yield_value: &u32,
    time: &u32,
    image_path: &Option<String>,
    directions: &Vec<String>,
    tags: &Vec<String>,
    color: &String,
) -> Result<(), sqlx::Error> {
    // Update recipe
    let _ = sqlx::query_file!(
        "db/update_recipe.sql",
        title,
        yield_value,
        time,
        image_path,
        color,
        id
    )
    .fetch_one(&mut **tx)
    .await?;

    let _ = sqlx::query_file!("db/delete_recipe_metadata.sql", id, id, id)
        .execute(&mut **tx)
        .await?;

    let _ = insert_related_data(tx, *id, ingredients, directions, tags).await?;

    Ok(())
}

pub async fn update_recipe(
    db: &Pool<Sqlite>,
    id: i64,
    title: &String,
    ingredients: &Vec<Ingredient>,
    yield_value: &u32,
    time: &u32,
    image_path: &Option<String>,
    directions: &Vec<String>,
    tags: &Vec<String>,
    color: &String,
) -> Result<(), String> {
    let _ = run_tx!(db, |tx| update_recipe_data(
        tx,
        &id,
        title,
        ingredients,
        yield_value,
        time,
        image_path,
        directions,
        tags,
        color,
    ))?;

    Ok(())
}

#[tauri::command]
pub async fn api_recipe_update(
    app: AppHandle,
    state: State<'_, AppState>,
    id: i64,
    title: String,
    ingredients: Vec<Ingredient>,
    yield_value: u32,
    time: u32,
    image: Option<String>,
    directions: Vec<String>,
    tags: Vec<String>,
    color: String,
) -> Result<(), String> {
    let db = &state.db;
    let images_lib_path = &state.images_lib_path;

    let image_path = get_processed_image(image, images_lib_path);

    let _ = update_recipe(
        db,
        id,
        &title,
        &ingredients,
        &yield_value,
        &time,
        &image_path,
        &directions,
        &tags,
        &color,
    )
    .await?;

    Ok(())
}
