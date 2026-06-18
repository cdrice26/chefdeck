use tauri::State;

use crate::{
    api::{ErrorResponse, SuccessResponse},
    crud::schedules::update_recipe_schedules,
    types::raw_db::{RawScheduleFormData, ScheduleFormData},
    AppState,
};

#[tauri::command]
pub async fn api_recipe_schedules_update(
    state: State<'_, AppState>,
    data: Vec<RawScheduleFormData>,
    id: i64,
) -> Result<SuccessResponse, ErrorResponse> {
    let schedule = data
        .into_iter()
        .map(|d| d.into_schedule_form_data(id))
        .collect::<Vec<ScheduleFormData>>();
    update_recipe_schedules(&state.db, &schedule)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;
    Ok(SuccessResponse {
        message: "Schedules updated successfully".to_string(),
    })
}
