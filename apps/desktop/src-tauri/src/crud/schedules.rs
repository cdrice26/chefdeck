use chrono::NaiveDate;
use sqlx::{Pool, Sqlite, Transaction};

use crate::{
    crud::{Readable, ReadableWith, Updatable},
    types::{
        db_params::DateFilter,
        raw_db::{RawSchedule, RawScheduleWithDisplayInfo, ScheduleFormData},
        response_bodies::{Schedule, ScheduleDisplay},
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

/// Wraps the retrieval of schedules for a date range in a transaction.
///
/// # Arguments
///
/// * `db` - The database pool to use for the operation.
/// * `start_date` - The start date of the range to filter by.
/// * `end_date` - The end date of the range to filter by.
///
/// # Returns
///
/// * `Ok(Vec<ScheduleDisplay>)` - The operation was successful.
/// * `Err` - An error occurred during the operation.
pub async fn get_schedules_for_date_range(
    db: &Pool<Sqlite>,
    start_date: &NaiveDate,
    end_date: &NaiveDate,
) -> Result<Vec<ScheduleDisplay>, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >| {
        Ok::<Vec<ScheduleDisplay>, Box<dyn std::error::Error>>(
            Vec::<ScheduleDisplay>::read_with(
                tx,
                0,
                DateFilter {
                    start_date,
                    end_date,
                },
            )
            .await?,
        )
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

impl ReadableWith<DateFilter<'_>> for Vec<ScheduleDisplay> {
    /// Retrieves a list of scheduled recipes within the specified date range.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction to use for the query.
    /// * `_id` - The ID of the recipe to retrieve schedules for (unused).
    /// * `addl_params` - Additional parameters for filtering the date range.
    ///     * `start_date` - The start date of the range to filter by.
    ///     * `end_date` - The end date of the range to filter by.
    ///
    /// # Returns
    ///
    /// A `Result` containing the list of `ScheduleDisplay` items, or an error if the query fails.
    async fn read_with(
        tx: &mut Transaction<'_, Sqlite>,
        _id: i64,
        addl_params: DateFilter<'_>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_schedules = sqlx::query_file_as!(
            RawScheduleWithDisplayInfo,
            "db/get_scheduled_recipes.sql",
            addl_params.start_date,
            addl_params.end_date,
            addl_params.end_date,
            addl_params.end_date,
            addl_params.start_date
        )
        .fetch_all(&mut **tx)
        .await?;
        let displays: Vec<ScheduleDisplay> = raw_schedules
            .into_iter()
            .flat_map(|r| r.into_schedule_displays(*addl_params.start_date, *addl_params.end_date))
            .collect();
        Ok(displays)
    }
}
