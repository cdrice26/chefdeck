use sqlx::{Sqlite, Transaction};

use crate::{crud::Creatable, types::raw_db::TagCloudId};

impl Creatable for TagCloudId {
    /// Inserts a new TagCloudId into the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the insert.
    ///
    /// # Returns
    ///
    /// The local ID of the inserted TagCloudId.
    async fn create(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        sqlx::query_file!("db/insert_tag_cloud_id.sql", self.local_id, self.username)
            .execute(&mut **tx)
            .await?;
        Ok(self.local_id)
    }
}
