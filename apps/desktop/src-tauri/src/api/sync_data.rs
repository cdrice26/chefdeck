use crate::{
    api::{
        get_cloud_image_path,
        recipe::{delete::delete_recipe, new::add_to_cloud},
    },
    crud::{
        recipe::{insert_recipe, update_recipe},
        recipes::get_recipes,
    },
    errors::StringifyError,
    img_proc::{download_image_from_signed_url, save_image},
    macros::run_tx,
    request::{get, post, recipe_post},
    types::{
        cloud_structs::{DownloadedRecipe, RecipeFormData},
        db_params::{UsernameAndUpdatedFilter, UsernameFilterWithImagesLibPath},
        raw_db::{IntegerValue, StringValue},
        response_bodies::Recipe,
    },
    AppState,
};
use chrono::NaiveDateTime;
use serde::Deserialize;
use serde_json::json;
use sqlx::{query_file_as, Sqlite, Transaction};
use tauri::{AppHandle, Manager};

use super::{auth::check_auth::get_username, GenericResponse};

#[derive(Debug, Deserialize)]
struct RecipeExistenceRecord {
    id: String,
    is_extant: bool,
}

async fn sync_recipes(app: AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = &state.db;

    // Get username
    let username = get_username(&state).await?;

    // Get all local recipes before downloading
    let local_recipes = match get_recipes::<UsernameFilterWithImagesLibPath>(
        db,
        UsernameFilterWithImagesLibPath {
            username: &username,
            images_lib_path: &state.images_lib_path,
        },
    )
    .await
    {
        Ok(recipes) => recipes,
        Err(e) => return Err(e.to_string()),
    };

    // Download recipes that only exist on the server
    let recipe_ids = local_recipes
        .iter()
        .map(|r| r.cloud_parent_id.clone())
        .filter(|r| r.is_some())
        .collect::<Vec<_>>();
    let recipe_id_json = json!({"recipeIds": recipe_ids}).to_string();
    let downloaded_recipes_response =
        post(&app, "/recipes/otherThan", recipe_id_json.as_str()).await?;
    let downloaded_recipes = downloaded_recipes_response
        .json::<GenericResponse<Vec<DownloadedRecipe>>>()
        .await
        .string_err()?;
    for recipe in downloaded_recipes.data {
        let username_option = Some(username.clone());
        let cloud_parent_id = recipe.id.clone();
        let local_image_path = match &recipe.image_path {
            Some(_) => {
                let signed_url_response =
                    get(&app, &format!("/recipe/{}/imageUrl", recipe.id.clone())).await?;
                let signed_url: String = signed_url_response.text().await.string_err()?;
                let image_bytes = download_image_from_signed_url(&signed_url).await?;
                save_image(&image_bytes, &state.images_lib_path)
            }
            None => None,
        };
        let mut recipe = recipe.into_form_data();
        recipe.image_path = local_image_path;
        recipe.cloud_parent_id = Some(cloud_parent_id);

        match insert_recipe(&state.db, recipe, username_option).await {
            Ok(_) => {}
            Err(e) => return Err(e.to_string()),
        }
    }

    // Delete recipes locally that have a cloud_parent_id but that don't exist on the server
    let existence_response = post(&app, "/recipes/whichExist", recipe_id_json.as_str())
        .await
        .map_err(|e| e.to_string())?;
    let downloaded_recipe_ids = existence_response
        .json::<GenericResponse<Vec<RecipeExistenceRecord>>>()
        .await
        .string_err()?;
    let nonexistent_recipe_cloud_ids: Vec<String> = downloaded_recipe_ids
        .data
        .into_iter()
        .filter(|r| !r.is_extant)
        .map(|r| r.id)
        .collect();
    let nonexistent_recipe_local_ids: Vec<i64> = local_recipes
        .iter()
        .filter(|r| {
            let cloud_parent_id = r.cloud_parent_id.as_ref();
            cloud_parent_id.is_some()
                && nonexistent_recipe_cloud_ids.contains(cloud_parent_id.unwrap_or(&String::new()))
        })
        .map(|recipe| recipe.id)
        .filter(|id| id.is_some())
        .map(|id| id.unwrap())
        .collect();
    for recipe_id in nonexistent_recipe_local_ids {
        delete_recipe(&state, recipe_id).await?;
    }

    // Upload recipes that don't exist on the server (error protection)
    let no_cloud_parent: Vec<&Recipe> = local_recipes
        .iter()
        .filter(|r| r.cloud_parent_id.is_none())
        .filter(|r| r.id.is_some())
        .collect();
    for recipe in no_cloud_parent {
        let image_path_for_cloud = get_cloud_image_path(&state, &recipe.img_url).await;
        add_to_cloud(
            &app,
            recipe.id.unwrap(),
            RecipeFormData {
                title: recipe.title.clone(),
                yield_value: recipe.servings as u32,
                time: recipe.minutes as u32,
                image_path: match recipe.img_url {
                    Some(_) => image_path_for_cloud,
                    None => None,
                },
                color: recipe.color.clone(),
                ingredients: recipe.ingredients.clone(),
                directions: recipe
                    .directions
                    .iter()
                    .map(|d| d.content.clone())
                    .collect(),
                tags: recipe
                    .tags
                    .iter()
                    .map(|t| t.name.clone().unwrap_or_default())
                    .collect(),
                source_url: recipe.source_url.clone(),
                last_viewed: match recipe.last_viewed.clone() {
                    Some(date) => Some(date.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
                    None => None,
                },
                last_updated: match recipe.last_updated.clone() {
                    Some(date) => Some(date.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
                    None => None,
                },
                cloud_parent_id: None,
            },
        )
        .await?;
    }

    // Update recipes on the server that have a newer version stored locally
    let last_synced_db = run_tx!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        query_file_as!(StringValue, "db/get_key_value.sql", "last_synced")
            .fetch_one(&mut **tx)
            .await
    })?;
    let last_synced_db = last_synced_db
        .value
        .unwrap_or(String::from("1970-01-01 00:00:00"));
    let last_synced_datetime =
        NaiveDateTime::parse_from_str(&last_synced_db, "%Y-%m-%d %H:%M:%S").unwrap_or_default();
    let last_synced = last_synced_datetime
        .format("%Y-%m-%dT%H:%M:%SZ")
        .to_string();
    let updated_local_recipes: Vec<Recipe> = get_recipes::<UsernameAndUpdatedFilter<'_>>(
        db,
        UsernameAndUpdatedFilter {
            username: &username,
            updated_after: &last_synced_datetime,
            images_lib_path: &state.images_lib_path,
        },
    )
    .await
    .map_err(|e| e.to_string())?;
    for recipe in updated_local_recipes {
        let image_path_for_cloud = get_cloud_image_path(&state, &recipe.img_url).await;
        let form_data = RecipeFormData {
            title: recipe.title.clone(),
            yield_value: recipe.servings as u32,
            time: recipe.minutes as u32,
            image_path: match recipe.img_url {
                Some(_) => image_path_for_cloud,
                None => None,
            },
            color: recipe.color.clone(),
            ingredients: recipe.ingredients.clone(),
            directions: recipe
                .directions
                .iter()
                .map(|d| d.content.clone())
                .collect(),
            tags: recipe
                .tags
                .iter()
                .map(|t| t.name.clone().unwrap_or_default())
                .collect(),
            source_url: recipe.source_url.clone(),
            last_viewed: match recipe.last_viewed.clone() {
                Some(date) => Some(date.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
                None => None,
            },
            last_updated: match recipe.last_updated.clone() {
                Some(date) => Some(date.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
                None => None,
            },
            cloud_parent_id: None,
        };
        if let Some(cloud_parent_id) = recipe.cloud_parent_id.as_deref() {
            let fetch_result = recipe_post(
                &app,
                format!("/recipe/{}/update", cloud_parent_id).as_str(),
                form_data,
            )
            .await;
            if let Err(err) = fetch_result {
                return Err(err.to_string());
            }
        }
    }

    // Update local recipes that have a newer version stored on the server
    let recipes_updated_since =
        get(&app, &format!("/recipes/updatedAfter/{}", last_synced)).await?;
    let downloaded_recipes: Vec<DownloadedRecipe> = recipes_updated_since
        .json::<GenericResponse<Vec<DownloadedRecipe>>>()
        .await
        .string_err()?
        .data;
    for recipe in downloaded_recipes {
        let _ = run_tx!(
            db,
            async |tx: &mut Transaction<'_, Sqlite>| -> Result<Option<i64>, sqlx::Error> {
                // Try to get the local id for this cloud recipe. If not found, return Ok(None) to skip.
                let local_row = query_file_as!(IntegerValue, "db/get_local_id.sql", recipe.id)
                    .fetch_one(&mut **tx)
                    .await;

                let local_id_opt = match local_row {
                    Ok(row) => row.value,
                    Err(_) => None,
                };

                if let Some(local_id) = local_id_opt {
                    let local_image_path = match recipe.image_path {
                        Some(_) => {
                            let signed_url_response =
                                get(&app, &format!("/recipe/{}/imageUrl", recipe.id.clone())).await;
                            if let Ok(signed_url_response) = signed_url_response {
                                let signed_url_result = signed_url_response.text().await;
                                if let Ok(signed_url) = signed_url_result {
                                    let image_bytes =
                                        download_image_from_signed_url(&signed_url).await;
                                    if let Ok(image_bytes) = image_bytes {
                                        save_image(&image_bytes, &state.images_lib_path)
                                    } else {
                                        None
                                    }
                                } else {
                                    None
                                }
                            } else {
                                None
                            }
                        }
                        None => None,
                    };

                    let mut recipe = recipe.into_local_recipe(local_id);
                    recipe.image_path = local_image_path;

                    match update_recipe(&db, recipe).await {
                        Ok(_) => Ok(Some(local_id)),
                        Err(_) => Ok(None),
                    }
                } else {
                    Ok(None)
                }
            }
        )?;
    }

    Ok(())
}

async fn sync_all(app: AppHandle) -> Result<(), String> {
    sync_recipes(app.clone()).await?;
    let state = app.state::<AppState>();
    let db = &state.db;
    run_tx!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        sqlx::query_file!("db/update_last_synced.sql")
            .execute(&mut **tx)
            .await?;
        Ok::<(), sqlx::Error>(())
    })?;
    Ok(())
}

#[tauri::command]
pub async fn sync_data(app: AppHandle) -> Result<(), String> {
    match sync_all(app).await {
        Ok(_) => Ok(()),
        Err(e) => Err({
            println!("Error syncing data: {}", e);
            format!("Error syncing data")
        }),
    }
}
