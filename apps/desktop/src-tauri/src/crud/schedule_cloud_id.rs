use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::{BatchReadableWith, Creatable, Deletable},
    types::{db_params::UsernameFilter, raw_db::ScheduleCloudId},
};

/// Wraps the create function for ScheduleCloudIds in a transaction.
///
/// # Arguments:
///     * `db` - sqlx Sqlite pool to use
///     * `cloud_id` - ScheduleCloudId instance to insert
pub async fn insert_schedule_cloud_id(
    db: &Pool<Sqlite>,
    cloud_id: &ScheduleCloudId,
) -> Result<i64, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >| { cloud_id.create(tx).await }))
}

/// Wraps the read_with method for schedule cloud ids in a transaction.
///
/// # Arguments:
///     * `db`: Database pool
///     * `username`: Logged in user
///
/// # Returns:
///     * Result with data if succcess, error if failure
pub async fn get_cloud_schedule_ids_for_user(
    db: &Pool<Sqlite>,
    username: &String,
) -> Result<Vec<ScheduleCloudId>, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >|
           -> Result<
        Vec<ScheduleCloudId>,
        Box<dyn std::error::Error>,
    > {
        Vec::<ScheduleCloudId>::read_with(tx, UsernameFilter { username }).await
    }))
}

/// Wraps the delete method of schedule cloud id in a transaction.
///
/// # Arguments:
///     * `db`: Database pool
///
/// # Returns:
///     * Result indicating success or failure
pub async fn delete_schedule_cloud_id(
    db: &Pool<Sqlite>,
    schedule_cloud_id: &ScheduleCloudId,
) -> Result<(), Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >|
           -> Result<
        (),
        Box<dyn std::error::Error>,
    > {
        schedule_cloud_id.delete(tx).await?;
        Ok(())
    }))
}

impl Creatable for ScheduleCloudId {
    /// Create a new ScheduleCloudId in the database.
    ///
    /// # Arguments:
    ///     * `tx` - The Sqlite transaction to use for the insert.
    ///
    /// # Returns:
    ///     * `Ok(id)` - The id of the inserted row
    ///     * `Err` - If an error occurred on insert
    async fn create(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        let row = sqlx::query_file!(
            "db/insert_schedule_cloud_id.sql",
            self.local_id,
            self.cloud_id,
            self.username
        )
        .fetch_one(&mut **tx)
        .await?;
        let id: i64 = row.id;
        Ok::<i64, Box<dyn std::error::Error>>(id)
    }
}

impl BatchReadableWith<UsernameFilter<'_>> for Vec<ScheduleCloudId> {
    /// Read all local schedule cloud IDs for a given username.
    ///
    /// # Arguments:
    ///     * `tx`: The database transaction to use.
    ///     * `addl_args`: UsernameFilter object to filter by username
    ///         * `username` - Reference to current username
    ///
    /// # Returns:
    ///     * Result with data if succcess, error if failure
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        addl_args: UsernameFilter<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(sqlx::query_file_as!(
            ScheduleCloudId,
            "db/get_schedule_cloud_ids.sql",
            addl_args.username
        )
        .fetch_all(&mut **tx)
        .await?)
    }
}

impl Deletable for ScheduleCloudId {
    /// Delete schedule cloud id by its properties.
    ///
    /// # Arguments:
    ///     * `tx`: Database transaction to use
    ///
    /// # Returns:
    ///     * Result indicating success or failure
    async fn delete(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query_file!(
            "db/delete_schedule_cloud_id.sql",
            self.local_id,
            self.cloud_id,
            self.username
        )
        .execute(&mut **tx)
        .await?;
        Ok(())
    }
}
