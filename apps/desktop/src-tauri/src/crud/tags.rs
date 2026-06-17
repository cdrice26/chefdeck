use sqlx::{Pool, Sqlite, Transaction};
use tauri::AppHandle;

use crate::{
    crud::{Downloadable, Readable, ReadableWith},
    request::get,
    types::cloud_structs::Tag,
    types::{db_params::UsernameFilter, response_bodies::RecipeTag},
};

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

/// Wraps the `get_tags_with_cloud_ids` query in a transaction and returns the list of tags as a `Vec<RecipeTag>`.
///
/// # Arguments
///
/// * `db` - A reference to the SQLite database pool.
/// * `username_filter` - A `UsernameFilter` struct containing the username to filter by.
///
/// # Returns
///
/// A `Result` containing a vector of `RecipeTag` if successful, or an error if one occurred.
pub async fn get_tags_with_cloud_ids(
    db: &Pool<Sqlite>,
    username_filter: UsernameFilter<'_>,
) -> Result<Vec<RecipeTag>, Box<dyn std::error::Error>> {
    let tags = run_tx_with_error!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        let tags = Vec::<RecipeTag>::read_with(tx, 0, username_filter).await?;
        Ok::<Vec<RecipeTag>, Box<dyn std::error::Error>>(tags)
    });
    Ok(tags)
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

impl ReadableWith<UsernameFilter<'_>> for Vec<RecipeTag> {
    /// Get all tags from the database with cloud IDs filtered by username.
    ///
    /// # Arguments
    ///
    /// * `tx` - A mutable reference to the SQLite transaction.
    /// * `_id` - Unused.
    /// * `addl_params` - Additional parameters including the username to filter by.
    ///
    /// # Returns
    ///
    /// A `Result` containing a vector of `RecipeTag` if successful, or an error if one occurred.
    async fn read_with(
        tx: &mut Transaction<'_, Sqlite>,
        _id: i64,
        addl_params: UsernameFilter<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(sqlx::query_file_as!(
            RecipeTag,
            "db/get_tags_with_cloud_ids.sql",
            addl_params.username
        )
        .fetch_all(&mut **tx)
        .await
        .map_err(|e| Box::new(e))?)
    }
}

impl Downloadable for Vec<RecipeTag> {
    /// Download all tags from the server.
    ///
    /// # Arguments
    ///
    /// * `app` - The application handle used to make the HTTP request.
    ///
    /// # Returns
    ///
    /// A `Result` containing a vector of `RecipeTag` if successful, or an error if one occurred.
    async fn download(app: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let result = get(app, "/tags").await?;
        let downloaded_tags: Vec<RecipeTag> = result
            .json::<Vec<Tag>>()
            .await?
            .into_iter()
            .map(|tag| RecipeTag {
                id: None,
                name: Some(tag.value),
            })
            .collect();
        Ok(downloaded_tags)
    }
}
