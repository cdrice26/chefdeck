use chrono::{DateTime, Utc};
use sqlx::{Sqlite, Transaction};

use crate::{
    crud::{Creatable, Deletable, Readable, Updatable},
    types::{
        cloud_structs::{LocalRecipe, RecipeFormData},
        raw_db::{HasRecipeContext, RawRecipeCommon, RecipeContext},
    },
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
    recipe_form_data: RecipeFormData,
    username: Option<String>,
) -> Result<i64, Box<dyn std::error::Error>> {
    let recipe_id = run_tx_with_error!(db, async |tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>| {
        let recipe_id = recipe_form_data.create(tx).await?;
        if let Some(online_recipe_id) = recipe_form_data.cloud_parent_id() {
            if let Some(username) = username {
                insert_cloud_parent_id(tx, recipe_id, username.as_str(), online_recipe_id.as_str())
                    .await?;
            }
        }
        Ok::<i64, Box<dyn std::error::Error>>(recipe_id)
    });

    Ok(recipe_id)
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

        let recipe_context = RecipeContext::from_form_data(self);

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
