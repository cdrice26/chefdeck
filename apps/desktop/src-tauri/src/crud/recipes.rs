use std::path::PathBuf;

use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::ReadableWith,
    types::{
        db_params::{
            ImagesLibPath, RecipeSearchParams, UsernameAndUpdatedFilter,
            UsernameFilterWithImagesLibPath,
        },
        parser::Parsable,
        raw_db::{RawRecipeCommon, RawRecipeSyncable, RawRecipeWithLastViewed, RecipeContext},
        response_bodies::Recipe,
    },
};
use chrono::NaiveDateTime;

/// Wraps the read_with method for recipe searches to create a transaction.
///
/// # Type Parameters
///
/// * `T` - The type of the additional search parameters to use for filtering recipes.
///
/// # Arguments
///
/// * `db` - The database pool to use for the transaction.
/// * `addl_params` - The search parameters to use for filtering recipes.
///
/// # Returns
///
/// * `Ok(Vec<Recipe>)` - The list of recipes that match the search parameters.
/// * `Err(Box<dyn std::error::Error>)` - An error if the transaction fails.
pub async fn get_recipes<T>(
    db: &Pool<Sqlite>,
    addl_params: T,
) -> Result<Vec<Recipe>, Box<dyn std::error::Error>>
where
    Vec<Recipe>: ReadableWith<T>,
{
    let result = run_tx_with_error!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        Vec::<Recipe>::read_with(tx, 0, addl_params).await
    });
    Ok(result)
}

/// Transforms a list of raw recipes into a list of recipes with their context.
///
/// # Arguments
///
/// * `tx` - The transaction to use for reading recipe context.
/// * `raw_recipes` - The list of raw recipes to transform.
/// * `images_lib_path` - The path to the images library.
///
/// # Returns
///
/// A list of recipes with their context.
async fn transform_recipes(
    tx: &mut Transaction<'_, Sqlite>,
    raw_recipes: Vec<impl RawRecipeCommon>,
    images_lib_path: PathBuf,
) -> Result<Vec<Recipe>, Box<dyn std::error::Error>> {
    let mut recipes = Vec::new();
    for r in raw_recipes {
        if let Some(r_id) = r.id() {
            let recipe_context = RecipeContext::read_with(
                tx,
                r_id,
                ImagesLibPath {
                    images_lib_path: &images_lib_path,
                },
            )
            .await?;
            recipes.push(r.parse(recipe_context)?);
        }
    }
    Ok(recipes)
}

impl ReadableWith<UsernameFilterWithImagesLibPath<'_>> for Vec<Recipe> {
    /// Reads all recipes for the given username.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for reading.
    /// * `_id` - The ID of the recipe to read (not used).
    /// * `addl_params` - The username and images library path to use for filtering.
    ///    * `username` - The username to filter by.
    ///    * `images_lib_path` - The images library path.
    ///
    /// # Returns
    ///
    /// A `Result` containing the list of recipes, or an error if one occurred.
    async fn read_with(
        tx: &mut Transaction<'_, Sqlite>,
        _id: i64,
        addl_params: UsernameFilterWithImagesLibPath<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_recipes = sqlx::query_file_as!(
            RawRecipeSyncable,
            "db/get_all_recipes.sql",
            addl_params.username
        )
        .fetch_all(&mut **tx)
        .await?;

        let recipes =
            transform_recipes(tx, raw_recipes, addl_params.images_lib_path.clone()).await?;

        Ok(recipes)
    }
}

impl ReadableWith<UsernameAndUpdatedFilter<'_>> for Vec<Recipe> {
    /// Retrieves a paginated list of recipes from the database based on the username and updated after parameters.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the database query.
    /// * `_id` - The ID of the recipe to retrieve (not used in this implementation).
    /// * `addl_params` - The additional search parameters to apply to the query.
    ///    * `username` - The username of the user to filter recipes by.
    ///    * `updated_after` - The date and time to filter recipes by.
    ///    * `images_lib_path` - The path to the images library to use for recipe thumbnails.
    ///
    /// # Returns
    ///
    /// A `Result` containing the list of recipes if successful, or an error if the query fails.
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        _id: i64,
        addl_params: UsernameAndUpdatedFilter<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_recipes_res = sqlx::query_file_as!(
            RawRecipeSyncable,
            "db/get_updated_local_recipes.sql",
            addl_params.username,
            addl_params.updated_after
        )
        .fetch_all(&mut **tx)
        .await?;

        let recipes =
            transform_recipes(tx, raw_recipes_res, addl_params.images_lib_path.clone()).await?;

        Ok(recipes)
    }
}

impl ReadableWith<RecipeSearchParams<'_>> for Vec<Recipe> {
    /// Retrieves a paginated list of recipes from the database based on the provided search parameters.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the database query.
    /// * `_id` - The ID of the recipe to retrieve (not used in this implementation).
    /// * `addl_params` - The search parameters to use for filtering recipes:
    ///   * `q` - The search query string.
    ///   * `tags` - The tags to filter recipes by.
    ///   * `page` - The page number of the results to retrieve.
    ///   * `limit` - The maximum number of results to retrieve.
    ///   * `images_lib_path` - The images library path to use.
    ///
    /// # Returns
    ///
    /// A `Result` containing the list of recipes if successful, or an error if the query fails.
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        _id: i64,
        addl_params: RecipeSearchParams<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_recipes = sqlx::query_file_as!(
            RawRecipeWithLastViewed,
            "db/get_recipes.sql",
            addl_params.q,
            addl_params.tags,
            addl_params.page,
            addl_params.limit
        )
        .fetch_all(&mut **tx)
        .await?;

        let recipes =
            transform_recipes(tx, raw_recipes, addl_params.images_lib_path.clone()).await?;

        Ok(recipes)
    }
}
