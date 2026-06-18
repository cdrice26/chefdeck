use chrono::NaiveDate;
use sqlx::{Pool, Sqlite, Transaction};
use tauri::{AppHandle, Emitter, Manager};

use crate::{
    api::{auth::check_auth::get_username, GenericResponse},
    crud::{
        cloud_id::get_cloud_id_with_username, BatchReadableWith, BatchUpdatable, Readable,
        RemoteUpdatable,
    },
    request::post,
    types::{
        db_params::{DateFilter, UsernameFilter},
        raw_db::{RawSchedule, RawScheduleWithDisplayInfo, ScheduleFormData, ScheduleFormDataList},
        response_bodies::{Schedule, ScheduleDisplay},
    },
    AppState,
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
/// * `Ok(Vec<i64>)` - The IDs of the schedules that were inserted or updated.
/// * `Err` - An error occurred during the operation.
pub async fn update_recipe_schedules(
    db: &Pool<Sqlite>,
    schedules: &Vec<ScheduleFormData>,
) -> Result<Vec<i64>, Box<dyn std::error::Error>> {
    Ok(run_tx_with_error!(db, async |tx: &mut Transaction<
        '_,
        Sqlite,
    >| {
        let result = schedules.update(tx).await?;
        Ok::<Vec<i64>, Box<dyn std::error::Error>>(result)
    }))
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
                DateFilter {
                    start_date,
                    end_date,
                },
            )
            .await?,
        )
    }))
}

impl BatchUpdatable for Vec<ScheduleFormData> {
    /// Inserts or updates the schedules for a recipe in the database.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction to use for the operation.
    ///
    /// # Returns
    ///
    /// * `Ok(ids)` - The IDs of the schedules that were inserted or updated.
    /// * `Err` - An error occurred during the operation.
    async fn update(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
    ) -> Result<Vec<i64>, Box<dyn std::error::Error>> {
        sqlx::query_file!("db/delete_recipe_schedules.sql", self[0].recipe_id)
            .execute(&mut **tx)
            .await?;
        let mut ids = Vec::new();
        for schedule in self {
            let id = sqlx::query_file!(
                "db/insert_recipe_schedules.sql",
                schedule.recipe_id,
                schedule.date,
                schedule.repeat,
                schedule.end_repeat
            )
            .execute(&mut **tx)
            .await?
            .last_insert_rowid();
            ids.push(id);
        }
        Ok(ids)
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

impl BatchReadableWith<DateFilter<'_>> for Vec<ScheduleDisplay> {
    /// Retrieves a list of scheduled recipes within the specified date range.
    ///
    /// # Arguments
    ///
    /// * `tx` - The database transaction to use for the query.
    /// * `addl_params` - Additional parameters for filtering the date range.
    ///     * `start_date` - The start date of the range to filter by.
    ///     * `end_date` - The end date of the range to filter by.
    ///
    /// # Returns
    ///
    /// A `Result` containing the list of `ScheduleDisplay` items, or an error if the query fails.
    async fn read_with(
        tx: &mut Transaction<'_, Sqlite>,
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

impl RemoteUpdatable for ScheduleFormDataList {
    /// Updates the schedule remotely by sending a POST request to the server.
    /// Emits an app event on failure rather than returning an error.
    ///
    /// # Arguments
    ///
    /// * `app` - The Tauri app handle used to emit events and make HTTP requests.
    ///
    /// # Returns
    ///
    /// * `Ok(())` - The schedule was successfully updated.
    /// * `Err` - An error occurred while updating the schedule.
    async fn update_remote(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
        let app = app.clone();
        let self_clone: ScheduleFormDataList = self.clone();
        tauri::async_runtime::spawn(async move {
            let result = self_clone.try_update_remote(&app).await;
            if let Err(_) = result {
                app.emit(
                    "schedule_update_cloud_error",
                    "Failed to sync schedule to cloud",
                )
                .ok();
                return Err(String::from("Failed to update schedule"));
            }
            Ok(())
        });
        Ok(())
    }
}

impl ScheduleFormDataList {
    /// Updates the schedule remotely by sending a POST request to the server.
    ///
    /// # Arguments
    ///
    /// * `app` - The Tauri app handle used to make HTTP requests.
    ///
    /// # Returns
    ///
    /// * `Ok(())` - The schedule was successfully updated.
    /// * `Err` - An error occurred while updating the schedule.
    pub async fn try_update_remote(
        self,
        app: &AppHandle,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let state = app.state::<AppState>();
        let username = get_username(&state).await?;
        let recipe_id = self.0[0].recipe_id;
        let cloud_recipe_id = get_cloud_id_with_username(
            &state.db,
            recipe_id,
            UsernameFilter {
                username: &username,
            },
        )
        .await?
        .cloud_id;
        let body = serde_json::to_string(&GenericResponse {
            data: &self
                .0
                .clone()
                .into_iter()
                .map(|s| s.into_cloud_schedule())
                .collect::<Vec<_>>(),
        })
        .unwrap_or_default();
        let response = post(
            &app,
            format!("/recipe/{}/schedules/update", cloud_recipe_id).as_str(),
            body.as_str(),
        )
        .await?;
        let cloud_schedule_ids = response.json::<GenericResponse<Vec<String>>>().await?.data;
        run_tx_with_error!(&state.db, async |tx: &mut Transaction<'_, Sqlite>| {
            let username_ref = &username;
            for (local_id, cloud_id) in self.0.iter().map(|s| s.id).zip(cloud_schedule_ids.iter()) {
                sqlx::query_file!(
                    "db/insert_schedule_cloud_id.sql",
                    local_id,
                    cloud_id,
                    username_ref
                )
                .execute(&mut **tx)
                .await?;
            }
            Ok::<(), Box<dyn std::error::Error>>(())
        });
        Ok(())
    }
}
