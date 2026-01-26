use tauri::{AppHandle, Emitter, State};
use std::path::PathBuf;

use crate::{api::{ErrorResponse, GenericResponse, SuccessResponse}, errors::StringifyError, macros::run_tx, request::delete, types::{raw_db::RawRecipe, response_bodies::CloudId}, AppState};

async fn delete_recipe_img(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id: i32, images_lib_path: &PathBuf) -> Result<(), String> {
    let recipe = sqlx::query_file_as!(RawRecipe, "db/get_recipe.sql", id)
        .fetch_one(&mut **tx)
        .await.string_err()?;
    let img_path = recipe.img_url;
    if let Some(img_path) = img_path {
        std::fs::remove_file(images_lib_path.join(img_path)).string_err()?;
    }
    Ok(())
}

async fn perform_delete(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id: i32, images_lib_path: &PathBuf) -> Result<(), sqlx::Error> {
    match delete_recipe_img(tx, id, images_lib_path).await {
        Ok(_) => {
            sqlx::query_file!("db/delete_recipe.sql", id, id, id, id, id, id, id)
                .execute(&mut **tx)
                .await?;
            Ok(())
        }
        Err(err) => Err(sqlx::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, err))),
    }
}

pub async fn get_cloud_id(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, id: i32) -> Result<String, sqlx::Error> {
    let cloud_id = sqlx::query_file_as!(CloudId, "db/get_cloud_id.sql", id)
        .fetch_one(&mut **tx)
        .await?;
    Ok(cloud_id.cloud_recipe_id)
}

pub async fn delete_recipe(state: &State<'_, AppState>, id: i32) -> Result<(), String> {
    let db = &state.db;
    run_tx!(db, |tx| perform_delete(tx, id, &state.images_lib_path))
}

async fn cloud_delete_recipe(app: &AppHandle, cloud_id: String) -> Result<(), String> {
    let resp = delete(app, format!("/recipe/{}/delete", cloud_id).as_str()).await;
    match resp {
        Ok(_) => Ok(()),
        Err(_) => Err(String::from("Failed to delete recipe from cloud")),
    }
}

#[tauri::command]
pub async fn api_recipe_delete(app: AppHandle, state: State<'_, AppState>, id: i32) -> Result<GenericResponse<SuccessResponse>, ErrorResponse> {
    let db = &state.db;
    let cloud_id_result = run_tx!(db, |tx| get_cloud_id(tx, id));
    let result = delete_recipe(&state, id).await;

    if result.is_ok() {
        let should_request = {
            let access_token_mutex = state.access_token.lock().await;
            if let Some(_) = access_token_mutex.as_ref() {
                true
            } else {
                false
            }
        };

        if should_request && cloud_id_result.is_ok() {
            tauri::async_runtime::spawn(async move {
                let cloud_result = cloud_delete_recipe(&app, cloud_id_result.unwrap()).await;
                if cloud_result.is_err() {
                    let _ = app.emit("delete_recipe_cloud_error", "Failed to delete recipe from cloud");
                }
            });
        }
    }

    match result {
        Ok(_) => Ok(GenericResponse { data: SuccessResponse::new(String::from("Recipe deleted successfully")) }),
        Err(err) => Err(ErrorResponse::new(String::from(err.to_string()))),
    }
}
