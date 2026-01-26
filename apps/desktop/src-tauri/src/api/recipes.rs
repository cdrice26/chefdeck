use std::path::PathBuf;

use crate::errors::StringifyError;
use crate::types::parser::Parsable;
use crate::types::raw_db::RawRecipeCommon;
use crate::{
    macros::run_tx,
    types::{
        raw_db::{RawRecipeWithLastViewed, RecipeContext},
        response_bodies::{Direction, Ingredient, Recipe, RecipeTag},
    },
    AppState,
};
use sqlx::{Pool, Sqlite, Transaction};
use tauri::State;

use super::GenericResponse;

async fn get_ingredients(
    tx: &mut Transaction<'_, Sqlite>,
    recipe_id: i64,
) -> Result<Vec<Ingredient>, sqlx::Error> {
    let ingredients = sqlx::query_file_as!(Ingredient, "db/get_ingredients.sql", recipe_id)
        .fetch_all(&mut **tx)
        .await?;
    Ok(ingredients)
}

async fn get_directions(
    tx: &mut Transaction<'_, Sqlite>,
    recipe_id: i64,
) -> Result<Vec<Direction>, sqlx::Error> {
    let directions = sqlx::query_file_as!(Direction, "db/get_directions.sql", recipe_id)
        .fetch_all(&mut **tx)
        .await?;
    Ok(directions)
}

async fn get_recipe_tags(
    tx: &mut Transaction<'_, Sqlite>,
    recipe_id: i64,
) -> Result<Vec<RecipeTag>, sqlx::Error> {
    let recipe_tags = sqlx::query_file_as!(RecipeTag, "db/get_recipe_tags.sql", recipe_id)
        .fetch_all(&mut **tx)
        .await?;
    Ok(recipe_tags)
}

/// Transforms a raw database record into a Recipe, incorporating its ingredients, directions, and tags.
///
/// Parameters:
/// - `r`: The raw database record to transform.
/// - `tx`: The database transaction to use.
///
/// Returns:
/// - A `Result` containing the transformed Recipe, or an error if the transformation fails.
pub async fn transform_recipe<T: RawRecipeCommon>(
    r: T,
    tx: &mut Transaction<'_, Sqlite>,
    images_lib_path: &PathBuf,
) -> Result<Recipe, sqlx::Error> {
    let r_id = match r.id() {
        Some(id) => id,
        None => return Err(sqlx::Error::RowNotFound),
    };

    let ingredients = get_ingredients(tx, r_id).await?;
    let directions = get_directions(tx, r_id).await?;
    let tags = get_recipe_tags(tx, r_id).await?;

    r.parse(RecipeContext {
        ingredients,
        directions,
        tags,
        images_lib_path: images_lib_path.clone(),
    })
}

async fn get_recipes(
    tx: &mut Transaction<'_, Sqlite>,
    images_lib_path: &PathBuf,
    page: u32,
    limit: u32,
    q: String,
    tags: String,
) -> Result<Vec<Recipe>, sqlx::Error> {
    let raw_recipes = sqlx::query_file_as!(RawRecipeWithLastViewed, "db/get_recipes.sql", q, tags, page, limit)
        .fetch_all(&mut **tx)
        .await?;
    let mut recipes = Vec::with_capacity(raw_recipes.len());

    for r in raw_recipes {
        recipes.push(transform_recipe(r, tx, images_lib_path).await?);
    }

    Ok(recipes)
}

async fn fetch_recipes_with_tx(
    db: &Pool<Sqlite>,
    images_lib_path: &PathBuf,
    page: u32,
    limit: u32,
    q: String,
    tags: String,
) -> Result<GenericResponse<Vec<Recipe>>, String> {
    // run_tx! resolves inside this async fn
    let recipes = run_tx!(db, |tx| get_recipes(tx, images_lib_path, page, limit, q, tags));

    match recipes {
        Ok(recipes) => Ok(GenericResponse { data: recipes }),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn api_recipes(
    state: State<'_, AppState>,
    page: Option<String>,
    limit: Option<String>,
    q: Option<String>,
    tags: Option<String>,
) -> Result<GenericResponse<Vec<Recipe>>, String> {
    let db = &state.db;
    let images_lib_path = &state.images_lib_path;

    let page = page.unwrap_or(String::new()).parse().unwrap_or(1);
    let limit = limit.unwrap_or(String::new()).parse().unwrap_or(20);
    let q = q.unwrap_or(String::new());
    let tags = tags.unwrap_or(String::new());

    let recipes = fetch_recipes_with_tx(db, images_lib_path, page, limit, q, tags).await;

    recipes
}
