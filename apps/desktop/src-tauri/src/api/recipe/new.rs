use tauri::{AppHandle, State};

use crate::{
    api::{auth::check_auth::get_username, should_request},
    crud::{recipe::insert_recipe, Uploadable},
    img_proc::get_processed_image,
    types::{cloud_structs::RecipeFormData, response_bodies::Ingredient},
    AppState,
};

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
        title: title,
        yield_value,
        time,
        image_path: image_path,
        color: color,
        ingredients: ingredients,
        directions: directions,
        tags: tags,
        source_url: source_url,
        last_viewed: None,
        last_updated: None,
        cloud_parent_id: None,
    };

    let recipe_id = match insert_recipe(&db, &recipe_form_data, username).await {
        Ok(recipe_id) => Ok(recipe_id),
        Err(err) => Err(err.to_string()),
    };

    if should_request(&state).await {
        if let Ok(recipe_id) = recipe_id {
            recipe_form_data
                .into_local_recipe(recipe_id)
                .upload(&app)
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    recipe_id
}
