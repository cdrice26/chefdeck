use chrono::{DateTime, Utc};
use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::Creatable,
    types::{
        raw_db::{HasRecipeContext, RawRecipeCommon},
        response_bodies::Ingredient,
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

/// Inserts related data for a recipe (ingredients, directions, tags).
///
/// # Arguments
///
/// * `tx` - The transaction to use for the insert.
/// * `recipe_id` - The ID of the recipe to insert related data for.
/// * `ingredients` - A vector of ingredients to insert.
/// * `directions` - A vector of directions to insert.
/// * `tags` - A vector of tags to insert.
///
/// # Returns
///
/// Returns the ID of the last inserted ingredient, or an error if one occurred.
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
        sqlx::query_file!("db/insert_direction.sql", recipe_id, direction, sequence)
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
        sqlx::query_file!("db/insert_recipe_tags.sql", recipe_id, tag_id)
            .execute(&mut **tx)
            .await?;
    }

    // Insert recipe usage record
    sqlx::query_file!("db/insert_recipe_usage.sql", recipe_id)
        .fetch_one(&mut **tx)
        .await?;

    Ok(recipe_id)
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

impl<T: RawRecipeCommon + HasRecipeContext> Creatable for T {
    /// Creates a new recipe in the database.
    ///
    /// # Arguments
    ///
    /// * `db` - The database pool to use for the insert.
    /// * `username` - The username of the user who owns the recipe.
    ///
    /// # Returns
    ///
    /// Returns the ID of the newly created recipe, or an error if one occurred.
    async fn create(
        &self,
        db: &Pool<Sqlite>,
        username: Option<String>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        let recipe_id = run_tx_with_error!(db, async |tx: &mut sqlx::SqliteTransaction| {
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

            if let Some(online_recipe_id) = self.cloud_parent_id() {
                if let Some(username) = username {
                    insert_cloud_parent_id(
                        tx,
                        recipe_id,
                        username.as_str(),
                        online_recipe_id.as_str(),
                    )
                    .await?;
                }
            }

            insert_related_data(
                tx,
                recipe_id,
                self.ingredients(),
                self.directions(),
                self.tags(),
            )
            .await
        });
        Ok(recipe_id)
    }
}
