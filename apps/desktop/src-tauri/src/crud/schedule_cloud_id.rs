use sqlx::{Pool, Sqlite, Transaction};

use crate::{crud::Creatable, types::raw_db::ScheduleCloudId};

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
