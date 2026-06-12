use crate::{crud::Creatable, types::raw_db::CloudId};

impl Creatable for CloudId {
    /// Inserts a new CloudId into the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The transaction to use for the insert.
    ///
    /// # Returns
    ///
    /// The local ID of the inserted CloudId.
    async fn create(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        sqlx::query_file!(
            "db/insert_cloud_id.sql",
            self.local_id,
            self.username,
            self.cloud_id
        )
        .execute(&mut **tx)
        .await?;
        Ok(self.local_id)
    }
}
