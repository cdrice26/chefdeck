use tauri::State;

use crate::{api::{ErrorResponse, GenericResponse, SuccessResponse}, errors::StringifyError, macros::run_tx, AppState};

async fn perform_delete(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id: i32) -> Result<(), sqlx::Error> {
    sqlx::query_file!("db/delete_recipe.sql", id, id, id, id, id, id, id)
        .execute(&mut **tx)
        .await?;
    Ok(())
}

pub async fn delete_recipe(state: State<'_, AppState>, id: i32) -> Result<(), String> {
    let db = &state.db;
    run_tx!(db, |tx| perform_delete(tx, id))
}

#[tauri::command]
pub async fn api_recipe_delete(state: State<'_, AppState>, id: i32) -> Result<GenericResponse<SuccessResponse>, ErrorResponse> {
    let result = delete_recipe(state, id).await;
    match result {
        Ok(_) => Ok(GenericResponse { data: SuccessResponse::new(String::from("Recipe deleted successfully")) }),
        Err(err) => Err(ErrorResponse::new(String::from(err.to_string()))),
    }
}
