use tauri::{AppHandle, State};

use crate::{
    api::{ErrorResponse, SuccessResponse},
    crud::{schedules::update_recipe_schedules, RemoteUpdatable},
    types::raw_db::{
        RawScheduleFormData, ScheduleFormData, ScheduleFormDataList, ScheduleFormDataListNoIds,
        ScheduleFormDataWithId,
    },
    AppState,
};

#[tauri::command]
pub async fn api_recipe_schedules_update(
    app: AppHandle,
    state: State<'_, AppState>,
    data: Vec<RawScheduleFormData>,
    id: i64,
) -> Result<SuccessResponse, ErrorResponse> {
    let schedule = data
        .into_iter()
        .map(|d| d.into_schedule_form_data(id))
        .collect::<Vec<ScheduleFormData>>();
    let mut schedule_ids = update_recipe_schedules(
        &state.db,
        &ScheduleFormDataListNoIds {
            list: schedule.clone(),
            recipe_id: id,
        },
    )
    .await
    .map_err(|e| ErrorResponse {
        error: e.to_string(),
    })?;
    ScheduleFormDataList {
        list: schedule
            .into_iter()
            .map(|s| s.into_schedule_form_data_with_id(schedule_ids.remove(0)))
            .collect::<Vec<ScheduleFormDataWithId>>(),
        recipe_id: id,
    }
    .update_remote(&app)
    .await
    .map_err(|e| ErrorResponse {
        error: e.to_string(),
    })?;
    Ok(SuccessResponse {
        message: "Schedules updated successfully".to_string(),
    })
}
