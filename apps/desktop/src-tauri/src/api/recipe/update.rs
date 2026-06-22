use tauri::{AppHandle, State};

use crate::{
    api::should_request,
    crud::{recipe::update_recipe, RemoteUpdatable},
    img_proc::get_processed_image,
    types::{cloud_structs::LocalRecipe, response_bodies::Ingredient},
    AppState,
};

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
        title: title,
        yield_value,
        time,
        image_path: image_path,
        directions: directions,
        tags: tags,
        color: color,
        ingredients: ingredients,
        source_url: None,
        last_viewed: None,
        last_updated: None,
        cloud_parent_id: None,
    };

    let result = match update_recipe(&db, &recipe_form_data, images_lib_path).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    };

    if should_request(&state).await {
        recipe_form_data
            .update_remote(&app)
            .await
            .map_err(|e| e.to_string())?;
    }

    result
}
