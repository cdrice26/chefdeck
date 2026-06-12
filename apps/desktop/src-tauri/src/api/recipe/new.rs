use crate::api::auth::check_auth::get_username;
use crate::api::{get_cloud_image_path, should_request};
use crate::crud::{recipe::insert_cloud_parent_id, Creatable};
use crate::img_proc::get_processed_image;
use crate::macros::run_tx;
use crate::request::recipe_post;
use crate::types::cloud_structs::RecipeFormData;
use crate::types::response_bodies::Ingredient;
use crate::AppState;
use crate::{api::GenericResponse, errors::StringifyError};
use serde::Deserialize;
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NewRecipeResponse {
    pub recipe_id: String,
}

pub async fn add_to_cloud(
    app: &AppHandle,
    recipe_id: i64,
    recipe: RecipeFormData,
) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = &state.db;
    let resp = recipe_post(&app, "/recipe/new", recipe).await;
    match resp {
        Ok(resp) => {
            let resp_data: GenericResponse<NewRecipeResponse> = resp.json().await.string_err()?;
            let online_recipe_id = resp_data.data.recipe_id;
            let username = get_username(&state).await?;
            let update_resp: Result<(), String> = run_tx!(db, |tx| insert_cloud_parent_id(
                tx,
                recipe_id,
                username.as_str(),
                online_recipe_id.as_str()
            ));
            if update_resp.is_err() {
                Err(update_resp.err().unwrap().to_string())
            } else {
                Ok(())
            }
        }
        Err(_) => Err(String::from("Failed to add recipe to cloud")),
    }
}

#[tauri::command]
pub async fn api_recipe_new(
    state: State<'_, AppState>,
    app: AppHandle,
    title: String,
    ingredients: Vec<Ingredient>,
    yield_value: u32,
    time: u32,
    image: Option<String>,
    directions: Vec<String>,
    tags: Vec<String>,
    color: String,
    source_url: Option<String>,
) -> Result<i64, String> {
    let db = &state.db;
    let images_lib_path = &state.images_lib_path;

    let image_path = get_processed_image(image, images_lib_path);

    let username = match get_username(&state).await {
        Ok(username) => Some(username),
        Err(_) => None,
    };

    let recipe_form_data = RecipeFormData {
        title: title.clone(),
        yield_value,
        time,
        image_path: image_path.clone(),
        color: color.clone(),
        ingredients: ingredients.clone(),
        directions: directions.clone(),
        tags: tags.clone(),
        source_url: source_url.clone(),
        last_viewed: None,
        last_updated: None,
        cloud_parent_id: None,
    };

    let recipe_id = match recipe_form_data.create(db, username).await {
        Ok(recipe_id) => Ok(recipe_id),
        Err(e) => Err(e.to_string()),
    };

    if should_request(&state).await {
        if let Ok(recipe_id) = recipe_id {
            let image_path_for_cloud = get_cloud_image_path(&state, &image_path).await;
            tauri::async_runtime::spawn(async move {
                let cloud_result = add_to_cloud(
                    &app,
                    recipe_id,
                    RecipeFormData {
                        title,
                        yield_value,
                        time,
                        image_path: match image_path {
                            Some(_) => image_path_for_cloud,
                            None => None,
                        },
                        color,
                        ingredients,
                        directions,
                        tags,
                        source_url,
                        last_viewed: None,
                        last_updated: None,
                        cloud_parent_id: None,
                    },
                )
                .await;
                if let Err(_) = cloud_result {
                    let _ = app.emit("new_recipe_cloud_error", "Failed to add recipe to cloud");
                }
            });
        }
    }

    recipe_id
}
