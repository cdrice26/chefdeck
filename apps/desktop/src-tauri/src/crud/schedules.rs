use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::{Readable, Updatable},
    types::{
        raw_db::{RawSchedule, ScheduleFormData},
        response_bodies::Schedule,
    },
};

/// Wraps the update of recipe schedules in a transaction.
///
/// # Arguments
///
/// * `db` - The database pool to use for the operation.
/// * `schedules` - The schedules to insert or update.
///
/// # Returns
///
/// * `Ok(())` - The operation was successful.
/// * `Err` - An error occurred during the operation.
pub async fn update_recipe_schedules(
    db: &Pool<Sqlite>,
    schedules: &Vec<ScheduleFormData>,
) -> Result<(), Box<dyn std::error::Error>> {
    run_tx_with_error!(db, async |tx: &mut Transaction<'_, Sqlite>| {
        schedules.update(tx).await?;
        Ok::<(), Box<dyn std::error::Error>>(())
    });
    Ok(())
}

/// Wraps the retrieval of schedules for a recipe in a transaction.
///
/// # Arguments
///
/// * `db` - The database pool to use for the operation.
/// * `id` - The ID of the recipe to retrieve schedules for.
///
/// # Returns
///
/// * `Ok(Vec<Schedule>)` - The operation was successful.
/// * `Err` - An error occurred during the operation.
pub async fn get_schedules_for_recipe(
    db: &Pool<Sqlite>,
    id: i64,
) -> Result<Vec<Schedule>, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >| {
        Ok::<Vec<Schedule>, Box<dyn std::error::Error>>(Vec::<Schedule>::read(tx, id).await?)
    }))
}

impl Updatable for Vec<ScheduleFormData> {
    /// Inserts or updates the schedules for a recipe in the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction to use for the operation.
    ///
    /// # Returns
    ///
    /// * `Ok(0)` - The operation was successful.
    /// * `Err` - An error occurred during the operation.
    async fn update(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        sqlx::query_file!("db/delete_recipe_schedules.sql", self[0].recipe_id)
            .execute(&mut **tx)
            .await?;
        for schedule in self {
            sqlx::query_file!(
                "db/insert_recipe_schedules.sql",
                schedule.recipe_id,
                schedule.date,
                schedule.repeat,
                schedule.end_repeat
            )
            .execute(&mut **tx)
            .await?;
        }
        Ok(0)
    }
}

impl Readable for Vec<Schedule> {
    /// Retrieves the schedules for a recipe from the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction to use for the operation.
    /// * `id` - The ID of the recipe to retrieve schedules for.
    ///
    /// # Returns
    ///
    /// * `Ok(schedules)` - The schedules for the recipe were successfully retrieved.
    /// * `Err` - An error occurred during the operation.
    async fn read(
        tx: &mut Transaction<'_, Sqlite>,
        id: i64,
    ) -> Result<Vec<Schedule>, Box<dyn std::error::Error>> {
        Ok(
            sqlx::query_file_as!(RawSchedule, "db/get_schedules_for_recipe.sql", id)
                .fetch_all(&mut **tx)
                .await?
                .into_iter()
                .map(|s| s.into_schedule())
                .collect::<Vec<Schedule>>(),
        )
    }
}
