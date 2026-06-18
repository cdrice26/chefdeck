use serde::Serialize;
use tauri::State;

use crate::{
    api::{ErrorResponse, GenericResponse},
    crud::recipe::get_recipe,
    types::response_bodies::Recipe,
    AppState,
};

pub mod delete;
pub mod new;
pub mod schedules;
pub mod update;

#[derive(Debug, Serialize)]
pub struct RecipeResponse {
    pub recipe: Recipe,
}

#[tauri::command]
pub async fn api_recipe(
    state: State<'_, AppState>,
    id: i64,
) -> Result<GenericResponse<RecipeResponse>, ErrorResponse> {
    let recipe = match get_recipe(state, id).await {
        Ok(recipe) => recipe,
        Err(e) => {
            return Err(ErrorResponse {
                error: e.to_string(),
            })
        }
    };

    Ok(GenericResponse {
        data: RecipeResponse { recipe },
    })
}
