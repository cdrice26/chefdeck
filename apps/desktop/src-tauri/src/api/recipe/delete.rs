use tauri::{AppHandle, State};

use crate::{
    api::{auth::check_auth::get_username, ErrorResponse, GenericResponse, SuccessResponse},
    crud::{
        cloud_id::get_cloud_id_with_username,
        recipe::{delete_recipe, get_raw_recipe},
        RemoteDeletable,
    },
    types::db_params::UsernameFilter,
    AppState,
};

#[tauri::command]
pub async fn api_recipe_delete(
    app: AppHandle,
    state: State<'_, AppState>,
    id: i64,
) -> Result<GenericResponse<SuccessResponse>, ErrorResponse> {
    let db = &state.db;
    let username = match get_username(&state).await {
        Ok(username) => Some(username),
        Err(_) => None,
    };

    let cloud_id_result = match get_cloud_id_with_username(
        db,
        id,
        UsernameFilter {
            username: &username.unwrap_or_default(),
        },
    )
    .await
    {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    };
    let recipe = match get_raw_recipe(&state, id).await {
        Ok(recipe) => recipe,
        Err(e) => {
            return Err(ErrorResponse {
                error: e.to_string(),
            })
        }
    };
    let _ = match delete_recipe(db, &recipe, &state.images_lib_path).await {
        Ok(result) => result,
        Err(e) => {
            return Err(ErrorResponse {
                error: e.to_string(),
            })
        }
    };

    let should_request = {
        let access_token_mutex = state.access_token.lock().await;
        if let Some(_) = access_token_mutex.as_ref() {
            true
        } else {
            false
        }
    };

    if should_request && (cloud_id_result.is_ok()) {
        let cloud_id = cloud_id_result.unwrap().cloud_id;
        let syncable = recipe.into_syncable(Some(cloud_id));
        syncable
            .delete_remote(&app)
            .await
            .map_err(|e| ErrorResponse {
                error: e.to_string(),
            })?;
    }

    Ok(GenericResponse {
        data: SuccessResponse::new(String::from("Recipe deleted successfully")),
    })
}
