use chrono::NaiveDate;
use tauri::State;

use crate::{
    api::{ErrorResponse, GenericResponse},
    crud::schedules::get_schedules_for_date_range,
    types::response_bodies::ScheduleDisplay,
    AppState,
};

#[tauri::command]
pub async fn api_recipes_scheduled(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Result<GenericResponse<Vec<ScheduleDisplay>>, ErrorResponse> {
    let start_date =
        NaiveDate::parse_from_str(&start_date, "%Y-%m-%dT%H:%M:%S.%fZ").map_err(|e| {
            ErrorResponse {
                error: e.to_string(),
            }
        })?;
    let end_date = NaiveDate::parse_from_str(&end_date, "%Y-%m-%dT%H:%M:%S.%fZ").map_err(|e| {
        ErrorResponse {
            error: e.to_string(),
        }
    })?;
    let data = get_schedules_for_date_range(&state.db, &start_date, &end_date)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;

    Ok(GenericResponse { data })
}
