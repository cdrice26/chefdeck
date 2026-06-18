use tauri::State;

use crate::{
    api::{ErrorResponse, GenericResponse},
    crud::schedules::get_schedules_for_recipe,
    types::response_bodies::Schedule,
    AppState,
};

pub mod update;

#[tauri::command]
pub async fn api_recipe_schedules(
    state: State<'_, AppState>,
    id: i64,
) -> Result<GenericResponse<Vec<Schedule>>, ErrorResponse> {
    let data = get_schedules_for_recipe(&state.db, id)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;
    Ok(GenericResponse { data })
}
