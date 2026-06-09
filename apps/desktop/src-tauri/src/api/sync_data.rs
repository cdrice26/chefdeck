use std::path::PathBuf;

use crate::{
    api::{
        get_cloud_image_path,
        recipe::{delete::delete_recipe, new::add_to_cloud, update::update_recipe_data_with_dates},
    },
    errors::StringifyError,
    img_proc::{download_image_from_signed_url, save_image},
    macros::run_tx,
    request::{get, post, recipe_post},
    types::{
        cloud_structs::{DownloadedRecipe, RecipeFormData},
        raw_db::{IntegerValue, RawRecipeSyncable, StringValue},
        response_bodies::Recipe,
    },
    AppState,
};
use chrono::NaiveDateTime;
use serde::Deserialize;
use serde_json::json;
use sqlx::{query_file_as, Sqlite, Transaction};
use tauri::{AppHandle, Manager};

use super::{
    auth::check_auth::get_username, recipe::new::insert_recipe_data, recipes::transform_recipe,
    GenericResponse,
};

#[derive(Debug, Deserialize)]
struct RecipeExistenceRecord {
    id: String,
    is_extant: bool,
}

async fn get_local_recipes(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    username: &str,
    images_lib_path: &PathBuf,
) -> Result<Vec<Recipe>, sqlx::Error> {
    let raw_recipes = sqlx::query_file_as!(RawRecipeSyncable, "db/get_all_recipes.sql", username)
        .fetch_all(&mut **tx)
        .await?;

    let mut recipes = Vec::with_capacity(raw_recipes.len());

    for r in raw_recipes {
        recipes.push(transform_recipe(r, tx, images_lib_path).await?);
    }

    Ok(recipes)
}

async fn sync_recipes(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = &state.db;

    // Get username
    let username = get_username(&state).await?;

    // Get all local recipes before downloading
    let local_recipes = run_tx!(db, |tx| get_local_recipes(
        tx,
        username.as_str(),
        &state.images_lib_path
    ))?;

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
        let cloud_parent_id = Some(recipe.id.clone());
        let username_option = Some(username.clone());
        let image_path = recipe.image_path.clone();
        let local_image_path = match image_path {
            Some(_) => {
                let signed_url_response =
                    get(&app, &format!("/recipe/{}/imageUrl", recipe.id.clone())).await?;
                let signed_url: String = signed_url_response.text().await.string_err()?;
                let image_bytes = download_image_from_signed_url(&signed_url).await?;
                save_image(&image_bytes, &state.images_lib_path)
            }
            None => None,
        };

        let _ = run_tx!(db, |tx| insert_recipe_data(
            tx,
            &recipe.title,
            &recipe.yield_value,
            &recipe.time,
            &local_image_path,
            &recipe.color,
            &recipe.ingredients,
            &recipe.directions,
            &recipe.tags,
            &recipe.source_url,
            &cloud_parent_id,
            &username_option,
            &recipe.last_viewed,
            &recipe.last_updated
        ));
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
    let updated_local_recipes: Vec<Recipe> =
        run_tx!(db, async |tx: &mut Transaction<'_, Sqlite>| {
            let raw_recipes_res = query_file_as!(
                RawRecipeSyncable,
                "db/get_updated_local_recipes.sql",
                username,
                last_synced_datetime
            )
            .fetch_all(&mut **tx)
            .await;

            match raw_recipes_res {
                Ok(raw_recipes) => {
                    let mut recipes = Vec::with_capacity(raw_recipes.len());
                    for r in raw_recipes {
                        recipes.push(transform_recipe(r, tx, &state.images_lib_path).await?);
                    }
                    Ok::<Vec<Recipe>, sqlx::Error>(recipes)
                }
                Err(err) => Err(err),
            }
        })?;
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

                    update_recipe_data_with_dates(
                        tx,
                        &local_id,
                        &recipe.title,
                        &recipe.ingredients,
                        &recipe.yield_value,
                        &recipe.time,
                        &local_image_path,
                        &recipe.directions,
                        &recipe.tags,
                        &recipe.color,
                        &recipe.last_updated,
                        &recipe.last_viewed,
                    )
                    .await?;
                    Ok(Some(local_id))
                } else {
                    Ok(None)
                }
            }
        )?;
    }

    Ok(())
}

async fn sync_all(app: AppHandle) -> Result<(), String> {
    sync_recipes(&app).await?;
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
