use super::GenericResponse;
use crate::crud::recipes::get_recipes;
use crate::types::db_params::RecipeSearchParams;
use crate::{types::response_bodies::Recipe, AppState};
use tauri::State;

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

    let search_params = RecipeSearchParams {
        q,
        tags,
        page,
        limit,
        images_lib_path: &images_lib_path,
    };

    let recipes = get_recipes::<RecipeSearchParams<'_>>(db, search_params).await;
    match recipes {
        Ok(recipes) => Ok(GenericResponse { data: recipes }),
        Err(err) => Err(err.to_string()),
    }
}
