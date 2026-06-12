use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
    api::{auth::check_auth::get_username, get_cloud_image_path, should_request},
    crud::{cloud_id::get_cloud_id_with_username, recipe::update_recipe},
    img_proc::get_processed_image,
    request::recipe_post,
    types::{
        cloud_structs::{LocalRecipe, RecipeFormData},
        db_params::UsernameFilter,
        response_bodies::Ingredient,
    },
    AppState,
};

async fn update_in_cloud(
    app: &AppHandle,
    recipe_id: i64,
    recipe: RecipeFormData,
) -> Result<(), String> {
    let state = app.state::<AppState>();
    let cloud_id_result = match get_cloud_id_with_username(
        &state.db,
        recipe_id,
        UsernameFilter {
            username: &get_username(&state).await?,
        },
    )
    .await
    {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    };

    if cloud_id_result.is_err() {
        return Err(String::from("Failed to get cloud id"));
    }
    let resp = recipe_post(
        &app,
        format!("/recipe/{}/update", cloud_id_result.unwrap().cloud_id).as_str(),
        recipe,
    )
    .await;
    if resp.is_err() {
        return Err(String::from("Failed to update recipe in cloud"));
    }
    Ok(())
}

#[tauri::command]
pub async fn api_recipe_update(
    app: AppHandle,
    state: State<'_, AppState>,
    id: i64,
    title: String,
    ingredients: Vec<Ingredient>,
    yield_value: u32,
    time: u32,
    image: Option<String>,
    directions: Vec<String>,
    tags: Vec<String>,
    color: String,
) -> Result<(), String> {
    let db = &state.db;
    let images_lib_path = &state.images_lib_path;

    let image_path = get_processed_image(image, images_lib_path);

    let recipe_form_data = LocalRecipe {
        id: id,
        title: title.clone(),
        yield_value,
        time,
        image_path: image_path.clone(),
        directions: directions.clone(),
        tags: tags.clone(),
        color: color.clone(),
        ingredients: ingredients.clone(),
        source_url: None,
        last_viewed: None,
        last_updated: None,
        cloud_parent_id: None,
    };

    let result = match update_recipe(&db, recipe_form_data).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    };

    if should_request(&state).await {
        let image_path_for_cloud = get_cloud_image_path(&state, &image_path).await;
        tauri::async_runtime::spawn(async move {
            let cloud_result = update_in_cloud(
                &app,
                id,
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
                    source_url: None,
                    last_viewed: None,
                    last_updated: None,
                    cloud_parent_id: None,
                },
            )
            .await;
            if let Err(_) = cloud_result {
                let _ = app.emit(
                    "update_recipe_cloud_error",
                    "Failed to update recipe in cloud",
                );
            }
        });
    }

    result
}
