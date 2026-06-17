use sqlx::{Pool, Sqlite, Transaction};
use tauri::{AppHandle, Emitter};

use crate::{
    crud::{Deletable, RemoteDeletable},
    request::delete,
    types::response_bodies::RecipeTag,
};

/// Wraps the delete operation for a tag in a transaction.
///
/// # Arguments
///
/// * `db` - The database pool to use for the transaction.
/// * `tag` - The tag to delete.
///
/// # Returns
///
/// * `Ok(())` - The tag was successfully deleted.
/// * `Err` - An error occurred while deleting the tag.
pub async fn delete_tag(
    db: &Pool<Sqlite>,
    tag: &RecipeTag,
) -> Result<(), Box<dyn std::error::Error>> {
    run_tx_with_error!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        tag.delete(tx).await?;
        Ok::<(), Box<dyn std::error::Error>>(())
    });
    Ok(())
}

impl Deletable for RecipeTag {
    /// Deletes the tag from the database by name.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the delete operation.
    ///
    /// # Returns
    ///
    /// * `Ok(())` - The tag was successfully deleted.
    /// * `Err` - An error occurred while deleting the tag.
    async fn delete(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query_file!("db/delete_tag.sql", self.name, self.name, self.name)
            .execute(&mut **tx)
            .await?;
        Ok(())
    }
}

impl RemoteDeletable for RecipeTag {
    async fn delete_remote(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
        let app = app.clone();
        let tag = self.clone();
        tauri::async_runtime::spawn(async move {
            if tag.try_delete_remote(&app).await.is_err() {
                let _ = app.emit(
                    "delete_recipe_cloud_error",
                    "Failed to delete recipe tag from cloud",
                );
            }
        });
        Ok(())
    }
}

impl RecipeTag {
    async fn try_delete_remote(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(name) = &self.name {
            delete(app, format!("/tags/delete?tagValue={}", name).as_str()).await?;
            Ok(())
        } else {
            Ok(())
        }
    }
}
