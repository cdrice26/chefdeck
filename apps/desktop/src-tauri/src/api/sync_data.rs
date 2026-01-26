use std::path::PathBuf;

use tauri::{AppHandle, Manager, State};
use crate::{macros::run_tx, types::{raw_db::RawRecipeSyncable, response_bodies::Recipe}, AppState, errors::StringifyError};

use super::{auth::check_auth::get_username, recipes::transform_recipe};

async fn get_local_recipes(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, username: &str, images_lib_path: &PathBuf) -> Result<Vec<Recipe>, sqlx::Error> {
    let raw_recipes = sqlx::query_file_as!(RawRecipeSyncable, "db/get_all_recipes.sql", username)
        .fetch_all(&mut **tx)
        .await?;

    let mut recipes = Vec::with_capacity(raw_recipes.len());

    for r in raw_recipes {
        recipes.push(transform_recipe(r, tx, images_lib_path).await?);
    }

    Ok(recipes)
}

async fn sync_recipes(state: &State<'_, AppState>) -> Result<(), String> {
    // Get username
    let username = get_username(state).await?;

    // Get all local recipes before downloading
    let local_recipes = run_tx!(&state.db, |tx| get_local_recipes(tx, username.as_str(), &state.images_lib_path))?;

    // Download recipes that only exist on the server
    // Requires new API route to get recipes that don't match an existing cloud_parent_id

    // Delete recipes locally that have a cloud_parent_id but that don't exist on the server
    // Requires new API route to check existence of each given a list of IDs
    // Also requires deletion functionality to be in place

    // Upload recipes that don't exist on the server (error protection)
    let no_cloud_parent: Vec<&Recipe> = local_recipes.iter().filter(|r| r.cloud_parent_id.is_none()).collect();

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
    let state = app.state::<AppState>();
    sync_recipes(&state).await?;
    Ok(())
}

#[tauri::command]
pub async fn sync_data(app: AppHandle) -> Result<(), String> {
    sync_all(app).await?;
    Ok(())
}
