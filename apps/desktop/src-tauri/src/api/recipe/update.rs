use sqlx::{Pool, Sqlite, Transaction};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
    api::{get_cloud_id, get_cloud_image_path, should_request},
    errors::StringifyError,
    img_proc::get_processed_image,
    macros::run_tx,
    request::recipe_post,
    types::{cloud_structs::RecipeFormData, response_bodies::Ingredient},
    AppState,
};

use super::new::insert_related_data;

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

async fn update_in_cloud(
    app: &AppHandle,
    recipe_id: i64,
    recipe: RecipeFormData,
) -> Result<(), String> {
    let state = app.state::<AppState>();
    let cloud_id = run_tx!(state.db, |tx| get_cloud_id(tx, recipe_id));
    let resp = recipe_post(
        &app,
        format!("/recipe/{}/update", cloud_id.unwrap_or_default()).as_str(),
        recipe,
    )
    .await;
    if resp.is_err() {
        return Err(String::from("Failed to update recipe in cloud"));
    }
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

    if should_request(&state).await {
        let image_path_for_cloud = get_cloud_image_path(&state, &image_path).await;
        tauri::async_runtime::spawn(async move {
            let cloud_result = update_in_cloud(
                &app,
                id,
                RecipeFormData {
                    title,
                    yield_value,
                    time,
                    image_path: match image_path {
                        Some(_) => image_path_for_cloud,
                        None => None,
                    },
                    color,
                    ingredients,
                    directions,
                    tags,
                    source_url: None,
                },
            )
            .await;
            if let Err(_) = cloud_result {
                let _ = app.emit(
                    "update_recipe_cloud_error",
                    "Failed to update recipe in cloud",
                );
            }
        });
    }

    Ok(())
}
