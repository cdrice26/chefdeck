use std::path::PathBuf;

use crate::{
    errors::StringifyError,
    macros::run_tx,
    request::post,
    types::{cloud_structs::DownloadedRecipe, raw_db::RawRecipeSyncable, response_bodies::Recipe},
    AppState,
};
use serde::Deserialize;
use serde_json::json;
use tauri::{AppHandle, Manager};

use super::{
    auth::check_auth::get_username, recipe::new::insert_recipe_data, recipes::transform_recipe,
    GenericResponse,
};

#[derive(Debug, Deserialize)]
struct RecipeExistenceRecord {
    id: String,
    exists: bool,
}

async fn get_local_recipes(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    username: &str,
    images_lib_path: &PathBuf,
) -> Result<Vec<Recipe>, sqlx::Error> {
    let raw_recipes = sqlx::query_file_as!(RawRecipeSyncable, "db/get_all_recipes.sql", username)
        .fetch_all(&mut **tx)
        .await?;

    let mut recipes = Vec::with_capacity(raw_recipes.len());

    for r in raw_recipes {
        recipes.push(transform_recipe(r, tx, images_lib_path).await?);
    }

    Ok(recipes)
}

async fn sync_recipes(app: AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = &state.db;

    // Get username
    let username = get_username(&state).await?;

    // Get all local recipes before downloading
    let local_recipes = run_tx!(db, |tx| get_local_recipes(
        tx,
        username.as_str(),
        &state.images_lib_path
    ))?;

    // Download recipes that only exist on the server
    let recipe_ids = local_recipes
        .iter()
        .map(|r| r.cloud_parent_id.clone())
        .filter(|r| r.is_some())
        .collect::<Vec<_>>();
    let recipe_id_json = json!({"recipeIds": recipe_ids}).to_string();
    let downloaded_recipes_response =
        post(&app, "/recipes/otherThan", recipe_id_json.as_str()).await?;
    let downloaded_recipes = downloaded_recipes_response
        .json::<GenericResponse<Vec<DownloadedRecipe>>>()
        .await
        .string_err()?;
    for recipe in downloaded_recipes.data {
        let cloud_parent_id = Some(recipe.id);
        let username_option = Some(username.clone());
        let _ = run_tx!(db, |tx| insert_recipe_data(
            tx,
            &recipe.title,
            &recipe.yield_value,
            &recipe.time,
            &recipe.image_path,
            &recipe.color,
            &recipe.ingredients,
            &recipe.directions,
            &recipe.tags,
            &recipe.source_url,
            &cloud_parent_id,
            &username_option
        ));
    }

    // Delete recipes locally that have a cloud_parent_id but that don't exist on the server

    // Upload recipes that don't exist on the server (error protection)
    let no_cloud_parent: Vec<&Recipe> = local_recipes
        .iter()
        .filter(|r| r.cloud_parent_id.is_none())
        .collect();

    // Update recipes on the server that have a newer version stored locally
    // Iterate through recipes with a cloud_parent_id, fetch recipe from server, compare dates,
    // and update the server recipe if necessary

    // Update local recipes that have a newer version stored on the server
    // Iterate through recipes with a cloud_parent_id, download the server version, compare dates,
    // and update the local recipe if necessary
    // Requires recipe update functionality to be in place

    Ok(())
}

async fn sync_all(app: AppHandle) -> Result<(), String> {
    sync_recipes(app).await?;
    Ok(())
}

#[tauri::command]
pub async fn sync_data(app: AppHandle) -> Result<(), String> {
    match sync_all(app).await {
        Ok(_) => Ok(()),
        Err(e) => Err({
            println!("Error syncing data: {}", e);
            format!("Error syncing data")
        }),
    }
}
