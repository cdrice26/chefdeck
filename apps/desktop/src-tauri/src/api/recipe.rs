use serde::Serialize;
use sqlx::query_file_as;
use tauri::State;

use crate::{api::{ErrorResponse, GenericResponse}, errors::StringifyError, macros::run_tx, types::{raw_db::RawRecipe, response_bodies::Recipe}, AppState};

use super::recipes::transform_recipe;

pub mod new;

#[derive(Debug, Serialize)]
pub struct RecipeResponse {
    pub recipe: Recipe
}

/// Get a recipe from the database by ID.
///
/// # Arguments:
///     tx: A mutable reference to a SQL transaction.
///     id: The ID of the recipe to retrieve.
///
/// # Returns:
///     A Result containing the retrieved recipe or an error.
pub async fn get_recipe(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id: i32) -> Result<Recipe, sqlx::Error> {
    let raw_recipe = query_file_as!(RawRecipe, "db/get_recipe.sql", id).fetch_one(&mut **tx).await?;
    let recipe = transform_recipe(raw_recipe, tx).await?;
    Ok(recipe)
}

#[tauri::command]
pub async fn api_recipe(state: State<'_, AppState>, id: i32) -> Result<GenericResponse<RecipeResponse>, ErrorResponse> {
    let db = &state.db;
    let recipe = run_tx!(db, |tx| get_recipe(tx, id))?;

    Ok(GenericResponse {
        data: RecipeResponse { recipe }
    })
}
