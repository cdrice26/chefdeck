use tauri::{AppHandle, Emitter, State};

use crate::{
    api::{auth::check_auth::get_username, ErrorResponse, GenericResponse, SuccessResponse},
    crud::{
        cloud_id::get_cloud_id_with_username,
        recipe::{delete_recipe, get_raw_recipe},
    },
    request::delete,
    types::db_params::UsernameFilter,
    AppState,
};

async fn cloud_delete_recipe(app: &AppHandle, cloud_id: String) -> Result<(), String> {
    let resp = delete(app, format!("/recipe/{}/delete", cloud_id).as_str()).await;
    match resp {
        Ok(_) => Ok(()),
        Err(_) => Err(String::from("Failed to delete recipe from cloud")),
    }
}

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
    let _ = match delete_recipe(db, recipe, &state.images_lib_path).await {
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
        tauri::async_runtime::spawn(async move {
            let cloud_result = cloud_delete_recipe(&app, cloud_id_result.unwrap().cloud_id).await;
            if cloud_result.is_err() {
                let _ = app.emit(
                    "delete_recipe_cloud_error",
                    "Failed to delete recipe from cloud",
                );
            }
        });
    }

    Ok(GenericResponse {
        data: SuccessResponse::new(String::from("Recipe deleted successfully")),
    })
}
