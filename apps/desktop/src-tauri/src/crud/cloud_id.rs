use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::{Creatable, ReadableWith},
    types::{
        db_params::UsernameFilter,
        raw_db::{CloudId, RawCloudId},
    },
};

pub async fn get_cloud_id_with_username(
    db: &Pool<Sqlite>,
    id: i64,
    username: UsernameFilter,
) -> Result<CloudId, Box<dyn std::error::Error>> {
    let cloud_id = run_tx_with_error!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        CloudId::read_with(tx, id, username).await
    });
    Ok(cloud_id)
}

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

impl ReadableWith<UsernameFilter> for CloudId {
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: i64,
        addl_params: UsernameFilter,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let cloud_id =
            sqlx::query_file_as!(RawCloudId, "db/get_cloud_id.sql", id, addl_params.username)
                .fetch_one(&mut **tx)
                .await?;
        Ok(CloudId {
            local_id: cloud_id.recipe_id.unwrap_or_default(),
            cloud_id: cloud_id.cloud_recipe_id,
            username: cloud_id.username,
        })
    }
}
