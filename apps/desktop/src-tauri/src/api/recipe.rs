use std::path::PathBuf;

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::query_file_as;
use tauri::State;

use crate::{
    api::{ErrorResponse, GenericResponse},
    errors::StringifyError,
    macros::run_tx,
    types::{raw_db::RawRecipe, response_bodies::Recipe},
    AppState,
};

use super::recipes::transform_recipe;

pub mod delete;
pub mod new;
pub mod update;

#[derive(Debug, Serialize)]
pub struct RecipeResponse {
    pub recipe: Recipe,
}

async fn perform_get_recipe(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    id: i32,
    images_lib_path: &PathBuf,
) -> Result<Recipe, sqlx::Error> {
    let raw_recipe = query_file_as!(RawRecipe, "db/get_recipe.sql", id)
        .fetch_one(&mut **tx)
        .await?;
    let recipe = transform_recipe(raw_recipe, tx, images_lib_path).await?;
    Ok(recipe)
}

/// Get a recipe from the database by ID.
///
/// # Arguments:
///     state: The application state.
///     id: The ID of the recipe to retrieve.
///
/// # Returns:
///     A Result containing the retrieved recipe or an error.
pub async fn get_recipe(state: State<'_, AppState>, id: i32) -> Result<Recipe, String> {
    let db = &state.db;
    let images_lib_path = &state.images_lib_path;
    run_tx!(db, |tx| perform_get_recipe(tx, id, images_lib_path))
}

#[tauri::command]
pub async fn api_recipe(
    state: State<'_, AppState>,
    id: i32,
) -> Result<GenericResponse<RecipeResponse>, ErrorResponse> {
    let recipe = get_recipe(state, id).await?;

    Ok(GenericResponse {
        data: RecipeResponse { recipe },
    })
}

/// Updates the last viewed and last updated dates for a recipe.
///
/// # Arguments:
///     tx: The transaction to use for the update.
///     last_viewed: The last viewed date as an optional string.
///     last_updated: The last updated date as an optional string.
///     recipe_id: The ID of the recipe to update.
///
/// # Returns:
///     A Result indicating success or failure.
pub async fn update_dates(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    last_viewed: &Option<String>,
    last_updated: &Option<String>,
    recipe_id: i64,
) -> Result<(), sqlx::Error> {
    if let Some(last_viewed) = last_viewed {
        let dt: DateTime<Utc> = last_viewed.parse().unwrap();
        let formatted = dt.format("%Y-%m-%d %H:%M:%S").to_string();

        sqlx::query_file!("db/update_last_viewed.sql", recipe_id, formatted)
            .fetch_one(&mut **tx)
            .await?;
    }

    if let Some(last_updated) = last_updated {
        let dt: DateTime<Utc> = last_updated.parse().unwrap();
        let formatted = dt.format("%Y-%m-%d %H:%M:%S").to_string();
        sqlx::query_file!("db/update_recipe_last_updated.sql", formatted, recipe_id)
            .fetch_one(&mut **tx)
            .await?;
    }

    Ok(())
}
