use sqlx::{Pool, Sqlite, Transaction};

use crate::{crud::Readable, types::response_bodies::RecipeTag};

/// Wraps the `get_tags` query in a transaction and returns the list of tags as a `Vec<RecipeTag>`.
///
/// # Arguments
///
/// * `db` - A reference to the SQLite database pool.
///
/// # Returns
///
/// A `Result` containing a vector of `RecipeTag` if successful, or an error if one occurred.
pub async fn get_tags(db: &Pool<Sqlite>) -> Result<Vec<RecipeTag>, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >| {
        let tags = Vec::<RecipeTag>::read(tx, 0).await?;
        Ok::<Vec<RecipeTag>, Box<dyn std::error::Error>>(tags)
    }))
}

impl Readable for Vec<RecipeTag> {
    /// Get all tags from the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - A mutable reference to the SQLite transaction.
    /// * `_id` - Unused.
    ///
    /// # Returns
    ///
    /// A `Result` containing a vector of `RecipeTag` if successful, or an error if one occurred.
    async fn read(
        tx: &mut Transaction<'_, Sqlite>,
        _id: i64,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(sqlx::query_file_as!(RecipeTag, "db/get_tags.sql")
            .fetch_all(&mut **tx)
            .await
            .map_err(|e| Box::new(e))?)
    }
}
