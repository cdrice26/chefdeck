use crate::api::auth::check_auth::get_username;
use crate::api::{get_cloud_image_path, should_request};
use crate::img_proc::get_processed_image;
use crate::macros::run_tx;
use crate::request::recipe_post;
use crate::types::cloud_structs::RecipeFormData;
use crate::types::response_bodies::Ingredient;
use crate::AppState;
use crate::{api::GenericResponse, errors::StringifyError};
use serde::Deserialize;
use sqlx::{Sqlite, Transaction};
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NewRecipeResponse {
    pub recipe_id: String,
}

pub async fn insert_related_data(
    tx: &mut Transaction<'_, Sqlite>,
    recipe_id: i64,
    ingredients: &Vec<Ingredient>,
    directions: &Vec<String>,
    tags: &Vec<String>,
) -> Result<i64, sqlx::Error> {
    // Insert ingredients
    for (i, ingredient) in ingredients.iter().enumerate() {
        let sequence = (i + 1) as i64;
        sqlx::query_file!(
            "db/insert_ingredient.sql",
            recipe_id,
            recipe_id,
            ingredient.name,
            ingredient.amount,
            ingredient.unit,
            sequence
        )
        .fetch_one(&mut **tx)
        .await?;
    }

    // Insert directions
    for (i, direction) in directions.iter().enumerate() {
        let sequence = (i + 1) as i64;
        sqlx::query_file!(
            "db/insert_direction.sql",
            recipe_id,
            recipe_id,
            direction,
            sequence
        )
        .fetch_one(&mut **tx)
        .await?;
    }

    let mut tag_ids: Vec<i64> = Vec::new();

    // Make sure user has all tags defined and get tag IDs
    for tag in tags.iter() {
        let tag_id = sqlx::query_file!("db/insert_user_tag.sql", tag)
            .fetch_one(&mut **tx)
            .await?;
        tag_ids.push(tag_id.id);
    }

    // Insert into recipe tags table
    for tag_id in tag_ids.iter() {
        sqlx::query_file!("db/insert_recipe_tags.sql", recipe_id, recipe_id, tag_id)
            .fetch_one(&mut **tx)
            .await?;
    }

    // Insert recipe usage record
    sqlx::query_file!("db/insert_recipe_usage.sql", recipe_id)
        .fetch_one(&mut **tx)
        .await?;

    Ok(recipe_id)
}

async fn insert_recipe_data(
    tx: &mut Transaction<'_, Sqlite>,
    title: &String,
    yield_value: &u32,
    time: &u32,
    image_path: &Option<String>,
    color: &String,
    ingredients: &Vec<Ingredient>,
    directions: &Vec<String>,
    tags: &Vec<String>,
    source_url: &Option<String>,
) -> Result<i64, sqlx::Error> {
    // Insert recipe
    let row = sqlx::query_file!(
        "db/insert_recipe.sql",
        title,
        yield_value,
        time,
        image_path,
        color,
        source_url
    )
    .fetch_one(&mut **tx)
    .await?;

    let recipe_id: i64 = row.id;

    insert_related_data(tx, recipe_id, ingredients, directions, tags).await
}

async fn insert_cloud_parent_id(
    tx: &mut Transaction<'_, Sqlite>,
    recipe_id: i64,
    username: &str,
    online_recipe_id: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query_file!(
        "db/insert_cloud_id.sql",
        recipe_id,
        username,
        online_recipe_id
    )
    .execute(&mut **tx)
    .await?;
    Ok(())
}

async fn add_to_cloud(
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
            let update_resp = run_tx!(db, |tx| insert_cloud_parent_id(
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

    let recipe_id = run_tx!(db, |tx| insert_recipe_data(
        tx,
        &title,
        &yield_value,
        &time,
        &image_path,
        &color,
        &ingredients,
        &directions,
        &tags,
        &source_url
    ));

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
