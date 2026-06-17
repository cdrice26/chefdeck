use tauri::State;

use crate::{api::ErrorResponse, crud::tags::get_tags, types::cloud_structs::Tag, AppState};

pub mod delete;

#[tauri::command]
pub async fn api_tags(state: State<'_, AppState>) -> Result<Vec<Tag>, ErrorResponse> {
    let db = &state.db;
    let tags = get_tags(db)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?
        .into_iter()
        .map(|tag| Tag {
            value: tag.name.clone().unwrap_or_default(),
            label: tag.name.clone().unwrap_or_default(),
        })
        .collect::<Vec<Tag>>();
    Ok(tags)
}
