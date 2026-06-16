use std::path::PathBuf;

use chrono::{DateTime, Utc};
use sqlx::{Sqlite, Transaction};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
    api::{auth::check_auth::get_username, GenericResponse},
    crud::{Creatable, Deletable, Readable, ReadableWith, Updatable, Uploadable},
    img_proc::{delete_recipe_img, get_cloud_image_path},
    request::recipe_post,
    types::{
        cloud_structs::{LocalRecipe, NewRecipeResponse, RecipeFormData},
        db_params::ImagesLibPath,
        parser::Parsable,
        raw_db::{
            CloudId, HasRecipeContext, RawRecipe, RawRecipeCommon, RecipeContext, ToRecipeFormData,
        },
        response_bodies::Recipe,
    },
    AppState,
};

/// Updates the last viewed and last updated dates for a recipe.
///
/// # Arguments:
///     tx: The transaction to use for the update.
///     last_viewed: The last viewed date as an optional string.
///     last_updated: The last updated date as an optional string.
///     recipe_id: The ID of the recipe to update.
///
/// # Returns:
///     A Result indicating success or failure.
pub async fn update_dates(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    last_viewed: &Option<String>,
    last_updated: &Option<String>,
    recipe_id: i64,
) -> Result<(), sqlx::Error> {
    if let Some(last_viewed) = last_viewed {
        let dt: DateTime<Utc> = last_viewed.parse().unwrap();
        let formatted = dt.format("%Y-%m-%d %H:%M:%S").to_string();

        sqlx::query_file!("db/update_last_viewed.sql", recipe_id, formatted)
            .fetch_one(&mut **tx)
            .await?;
    }

    if let Some(last_updated) = last_updated {
        let dt: DateTime<Utc> = last_updated.parse().unwrap();
        let formatted = dt.format("%Y-%m-%d %H:%M:%S").to_string();
        sqlx::query_file!("db/update_recipe_last_updated.sql", formatted, recipe_id)
            .fetch_one(&mut **tx)
            .await?;
    }

    Ok(())
}

/// Inserts the cloud parent ID for a recipe.
///
/// # Arguments
///
/// * `tx` - The transaction to use for the insert.
/// * `recipe_id` - The ID of the recipe to insert the cloud parent ID for.
/// * `username` - The username of the user who owns the recipe.
/// * `online_recipe_id` - The ID of the recipe on the cloud.
///
/// # Returns
///
/// Returns `Ok(())` if the insert was successful, or an error if one occurred.
pub async fn insert_cloud_parent_id(
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

/// Wrapper for recipe_form_data.create that creates the database transaction
///
/// # Arguments:
/// * `db` - The database pool to use for the transaction.
/// * `recipe_form_data` - The recipe data to insert.
/// * `username` - The username of the user who owns the recipe.
///
/// # Returns:
/// `Ok(recipe_id)` if the insert was successful, or an error if one occurred.
pub async fn insert_recipe(
    db: &sqlx::SqlitePool,
    recipe_form_data: &RecipeFormData,
    username: Option<String>,
) -> Result<i64, Box<dyn std::error::Error>> {
    let recipe_id = run_tx_with_error!(db, async |tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>| {
        let recipe_id = recipe_form_data.create(tx).await?;
        if let Some(online_recipe_id) = recipe_form_data.cloud_parent_id() {
            if let Some(username) = username {
                let cloud_id = CloudId {
                    local_id: recipe_id,
                    cloud_id: online_recipe_id,
                    username,
                };
                cloud_id.create(tx).await?;
            }
        }
        Ok::<i64, Box<dyn std::error::Error>>(recipe_id)
    });

    Ok(recipe_id)
}

/// Wraps the read_with method of Recipe to create a database transaction.
///
/// # Arguments:
///     state: The application state.
///     id: The ID of the recipe to retrieve.
///
/// # Returns:
///     A Result containing the retrieved recipe or an error.
pub async fn get_recipe(
    state: State<'_, AppState>,
    id: i64,
) -> Result<Recipe, Box<dyn std::error::Error>> {
    let db = &state.db;
    let images_lib_path = &state.images_lib_path;
    let recipe = run_tx_with_error!(db, |tx| Recipe::read_with(
        tx,
        id,
        ImagesLibPath {
            images_lib_path: &images_lib_path
        }
    ));
    Ok(recipe)
}

/// Wraps the read method of RawRecipe to create a database transaction.
///
/// # Arguments:
///     state: The application state.
///     id: The ID of the recipe to retrieve.
///
/// # Returns:
///     A Result containing the retrieved recipe or an error.
pub async fn get_raw_recipe(
    state: &State<'_, AppState>,
    id: i64,
) -> Result<RawRecipe, Box<dyn std::error::Error>> {
    let db = &state.db;
    let recipe = run_tx_with_error!(db, |tx| RawRecipe::read(tx, id));
    Ok(recipe)
}

/// Wrapper for recipe_form_data.update that creates the database transaction
///
/// # Arguments:
/// * `db` - The database pool to use for the transaction.
/// * `recipe_form_data` - The recipe data to update.
///
/// # Returns:
/// `Ok(recipe_id)` if the update was successful, or an error if one occurred.
pub async fn update_recipe(
    db: &sqlx::SqlitePool,
    recipe_form_data: LocalRecipe,
) -> Result<i64, Box<dyn std::error::Error>> {
    let recipe_id = run_tx_with_error!(db, async |tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>| {
        recipe_form_data.update(tx).await
    });
    Ok(recipe_id)
}

/// Wrapper for recipe.delete that creates the database transaction and deletes the recipe's image from the images library.
///
/// # Arguments:
/// * `db` - The database pool to use for the transaction.
/// * `recipe` - The recipe to delete.
/// * `images_lib_path` - The path to the images library to delete the recipe's image from.
///
/// # Returns:
/// `Ok(())` if the delete was successful, or an error if one occurred.
pub async fn delete_recipe<T: RawRecipeCommon>(
    db: &sqlx::SqlitePool,
    recipe: T,
    images_lib_path: &PathBuf,
) -> Result<(), Box<dyn std::error::Error>> {
    let id = match recipe.id() {
        Some(id) => id,
        None => {
            return Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                "recipe id is required",
            )))
        }
    };
    run_tx_with_error!(db, async |tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>| {
        delete_recipe_img(tx, id, images_lib_path).await?;
        sqlx::query_file!("db/delete_recipe.sql", id, id, id, id, id, id, id)
            .execute(&mut **tx)
            .await?;
        Ok::<(), Box<dyn std::error::Error>>(())
    });
    Ok(())
}

impl<T: RawRecipeCommon + HasRecipeContext> Creatable for T {
    /// Creates a new recipe in the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction to use for the insert.
    ///
    /// # Returns
    ///
    /// Returns the ID of the newly created recipe, or an error if one occurred.
    async fn create(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        let title = self.title();
        let yield_ = self.yield_();
        let minutes = self.minutes();
        let img_url = self.img_url();
        let color = self.color();
        let source = self.source();

        let row = sqlx::query_file!(
            "db/insert_recipe.sql",
            title,
            yield_,
            minutes,
            img_url,
            color,
            source
        )
        .fetch_one(&mut **tx)
        .await?;

        let recipe_id: i64 = row.id;

        update_dates(
            tx,
            &self
                .last_viewed()
                .as_ref()
                .map(|v| v.format("%Y-%m-%d %H:%M:%S").to_string()),
            &self
                .last_updated()
                .as_ref()
                .map(|v| v.format("%Y-%m-%d %H:%M:%S").to_string()),
            recipe_id,
        )
        .await?;

        let mut recipe_context = RecipeContext::from_form_data(self);
        recipe_context.recipe_id = recipe_id;

        recipe_context.create(tx).await?;
        Ok(recipe_id)
    }
}

impl<T: RawRecipeCommon + HasRecipeContext> Updatable for T {
    /// Updates the recipe in the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction.
    ///
    /// # Returns
    ///
    /// Returns the ID of the updated recipe.
    async fn update(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        let title = self.title();
        let yield_value = self.yield_();
        let time = self.minutes();
        let image_path = self.img_url();
        let color = self.color();
        let id = self.id().unwrap_or(0);
        let last_viewed = self
            .last_viewed()
            .as_ref()
            .map(|v| v.format("%Y-%m-%d %H:%M:%S").to_string());
        let last_updated = self
            .last_updated()
            .as_ref()
            .map(|v| v.format("%Y-%m-%d %H:%M:%S").to_string());

        let _ = sqlx::query_file!(
            "db/update_recipe.sql",
            title,
            yield_value,
            time,
            image_path,
            color,
            id
        )
        .fetch_one(&mut **tx)
        .await?;

        update_dates(tx, &last_viewed, &last_updated, id).await?;

        let recipe_context = RecipeContext::from_form_data(self);

        recipe_context.delete(tx).await?;
        recipe_context.create(tx).await?;

        Ok(id)
    }
}

impl Readable for RawRecipe {
    /// Reads a raw recipe from the database by ID.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the query.
    /// * `id` - The ID of the recipe to read.
    ///
    /// # Returns
    ///
    /// A `RawRecipe` if one is found, otherwise an error.
    async fn read(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: i64,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_recipe = sqlx::query_file_as!(RawRecipe, "db/get_recipe.sql", id)
            .fetch_one(&mut **tx)
            .await?;
        Ok(raw_recipe)
    }
}

impl ReadableWith<ImagesLibPath<'_>> for Recipe {
    /// Reads a recipe from the database by ID, including additional parameters for the images library path.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the query.
    /// * `id` - The ID of the recipe to read.
    /// * `addl_params` - Additional parameters, including the images library path.
    ///
    /// # Returns
    ///
    /// A `Recipe` if one is found, otherwise an error.
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: i64,
        addl_params: ImagesLibPath<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_recipe = RawRecipe::read(tx, id).await?;
        let recipe_context = RecipeContext::read_with(tx, id, addl_params).await?;
        let recipe = raw_recipe.parse(recipe_context)?;
        Ok(recipe)
    }
}

impl<T: RawRecipeCommon> Deletable for T {
    /// Deletes a recipe from the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the query.
    ///
    /// # Returns
    ///
    /// A `Result` indicating success or failure.
    async fn delete(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let id = match self.id() {
            Some(id) => id,
            None => {
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    "id is required",
                )))
            }
        };
        sqlx::query_file!("db/delete_recipe.sql", id, id, id, id, id, id, id)
            .execute(&mut **tx)
            .await?;
        Ok(())
    }
}

impl<T: RawRecipeCommon + HasRecipeContext + ToRecipeFormData> Uploadable for T {
    /// Uploads the recipe to the cloud.
    ///
    /// # Arguments:
    ///
    /// * `app` - The Tauri app handle.
    ///
    /// # Returns:
    ///
    /// * `Ok(())` - The recipe was successfully uploaded.
    /// * `Err` - An error occurred while uploading the recipe.
    async fn upload(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
        let state: State<AppState> = app.state();
        let image_path_for_cloud = get_cloud_image_path(&state, &self.img_url()).await;
        let Some(recipe_id) = self.id() else {
            return Ok(());
        };

        let app = app.clone();
        let image_path = self.img_url();
        let form_data = self.into_recipe_form_data();

        tauri::async_runtime::spawn(async move {
            if let Err(_) = form_data
                .try_upload(&app, recipe_id, image_path, image_path_for_cloud)
                .await
            {
                let _ = app.emit("new_recipe_cloud_error", "Failed to add recipe to cloud");
            }
        });

        Ok(())
    }
}

impl RecipeFormData {
    /// Attempts to upload the recipe to the cloud.
    ///
    /// # Arguments:
    ///
    /// * `app` - The Tauri app handle.
    /// * `recipe_id` - The local recipe ID.
    /// * `image_path` - The local image path.
    /// * `image_path_for_cloud` - The cloud image path.
    ///
    /// # Returns:
    ///
    /// * `Ok(())` - The upload was successful.
    /// * `Err` - The upload failed.
    pub async fn try_upload(
        self,
        app: &AppHandle,
        recipe_id: i64,
        image_path: Option<String>,
        image_path_for_cloud: Option<String>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let state = app.state::<AppState>();

        let cloud_recipe = RecipeFormData {
            image_path: image_path.and(image_path_for_cloud),
            ..self
        };

        let resp_data: GenericResponse<NewRecipeResponse> =
            recipe_post(app, "/recipe/new", cloud_recipe)
                .await?
                .json()
                .await?;

        let online_recipe_id = resp_data.data.recipe_id;
        let username = get_username(&state).await?;

        run_tx_with_error!(&state.db, |tx| {
            insert_cloud_parent_id(tx, recipe_id, username.as_str(), online_recipe_id.as_str())
        });

        Ok(())
    }
}
