use tauri::{AppHandle, State};

use crate::{
    api::{should_request, ErrorResponse},
    crud::{tag::delete_tag, RemoteDeletable},
    types::response_bodies::RecipeTag,
    AppState,
};

#[tauri::command]
pub async fn api_tags_delete(
    state: State<'_, AppState>,
    app: AppHandle,
    tag_value: String,
) -> Result<(), ErrorResponse> {
    let db = &state.db;
    let recipe_tag = RecipeTag {
        name: Some(tag_value),
        id: None,
    };
    delete_tag(db, &recipe_tag)
        .await
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;
    if should_request(&state).await {
        if recipe_tag.name.is_some() {
            recipe_tag
                .delete_remote(&app)
                .await
                .map_err(|e| ErrorResponse {
                    error: e.to_string(),
                })?;
        }
    }
    Ok(())
}
