use sqlx::{Sqlite, Transaction};

use crate::{
    crud::{Creatable, Deletable},
    types::raw_db::RecipeContext,
};

impl Creatable for RecipeContext {
    /// Inserts the recipe context into the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the insert.
    ///
    /// # Returns
    ///
    /// The ID of the inserted recipe.
    async fn create(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        // Insert ingredients
        for (i, ingredient) in self.ingredients.iter().enumerate() {
            let sequence = (i + 1) as i64;
            sqlx::query_file!(
                "db/insert_ingredient.sql",
                self.recipe_id,
                ingredient.name,
                ingredient.amount,
                ingredient.unit,
                sequence
            )
            .fetch_one(&mut **tx)
            .await?;
        }

        // Insert directions
        for (i, direction) in self.directions.iter().enumerate() {
            let sequence = (i + 1) as i64;
            sqlx::query_file!(
                "db/insert_direction.sql",
                self.recipe_id,
                direction.content,
                sequence
            )
            .fetch_one(&mut **tx)
            .await?;
        }

        let mut tag_ids: Vec<i64> = Vec::new();

        let tag_names: Vec<String> = self.tags.iter().filter_map(|t| t.name.clone()).collect();

        for tag in &tag_names {
            let tag_id = sqlx::query_file!("db/insert_user_tag.sql", tag)
                .fetch_one(&mut **tx)
                .await?;
            tag_ids.push(tag_id.id);
        }

        // Insert into recipe tags table
        for tag_id in tag_ids.iter() {
            sqlx::query_file!("db/insert_recipe_tags.sql", self.recipe_id, tag_id)
                .execute(&mut **tx)
                .await?;
        }

        // Insert recipe usage record
        sqlx::query_file!("db/insert_recipe_usage.sql", self.recipe_id)
            .fetch_one(&mut **tx)
            .await?;

        Ok(self.recipe_id)
    }
}

impl Deletable for RecipeContext {
    /// Deletes the recipe context from the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the delete.
    ///
    /// # Returns
    ///
    /// A result indicating success or failure.
    async fn delete(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let id = self.recipe_id;
        sqlx::query_file!("db/delete_recipe_metadata.sql", id, id, id)
            .execute(&mut **tx)
            .await?;

        Ok(())
    }
}
