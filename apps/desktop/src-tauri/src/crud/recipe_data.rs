use chrono::NaiveDate;
use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::{BatchReadableWith, Creatable, Deletable, ReadableWith},
    types::{
        db_params::{DateFilter, ImagesLibPath},
        raw_db::RecipeContext,
        response_bodies::{Direction, Ingredient, RecipeTag},
    },
};

pub async fn get_groceries(
    db: &Pool<Sqlite>,
    start_date: NaiveDate,
    end_date: NaiveDate,
) -> Result<Vec<Ingredient>, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >| Vec::<Ingredient>::read_with(
        tx,
        DateFilter {
            start_date: &start_date,
            end_date: &end_date,
        }
    )
    .await))
}

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

impl ReadableWith<ImagesLibPath<'_>> for RecipeContext {
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: i64,
        addl_params: ImagesLibPath<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let ingredients = sqlx::query_file_as!(Ingredient, "db/get_ingredients.sql", id)
            .fetch_all(&mut **tx)
            .await?;
        let directions = sqlx::query_file_as!(Direction, "db/get_directions.sql", id)
            .fetch_all(&mut **tx)
            .await?;
        let recipe_tags = sqlx::query_file_as!(RecipeTag, "db/get_recipe_tags.sql", id)
            .fetch_all(&mut **tx)
            .await?;
        Ok(RecipeContext {
            recipe_id: id,
            ingredients,
            directions,
            tags: recipe_tags,
            images_lib_path: addl_params.images_lib_path.to_path_buf(),
        })
    }
}

impl BatchReadableWith<DateFilter<'_>> for Vec<Ingredient> {
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        addl_params: DateFilter<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let start_str = addl_params.start_date.to_string();
        let end_str = addl_params.end_date.to_string();
        let groceries =
            sqlx::query_file_as!(Ingredient, "db/get_groceries.sql", start_str, end_str)
                .fetch_all(&mut **tx)
                .await;
        Ok(groceries?)
    }
}
