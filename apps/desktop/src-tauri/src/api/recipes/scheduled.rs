use crate::{
    api::{ErrorResponse, GenericResponse},
    types::response_bodies::Schedule,
};

#[tauri::command]
pub async fn api_recipes_scheduled() -> Result<GenericResponse<Vec<Schedule>>, ErrorResponse> {
    Ok(GenericResponse { data: Vec::new() })
}
