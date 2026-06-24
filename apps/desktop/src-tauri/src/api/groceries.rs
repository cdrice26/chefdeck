use chrono::NaiveDate;
use tauri::State;

use crate::{
    api::{ErrorResponseWithMessage, GenericResponse},
    crud::recipe_data::get_groceries,
    AppState,
};

use groceryify::{ingredient::Ingredient, merge};

#[tauri::command]
pub async fn api_groceries(
    state: State<'_, AppState>,
    from_date: String,
    to_date: String,
) -> Result<GenericResponse<Vec<Ingredient>>, ErrorResponseWithMessage> {
    let start_date = NaiveDate::parse_from_str(&from_date, "%Y-%m-%d")
        .map_err(|e| ErrorResponseWithMessage::new(e.to_string()))?;
    let end_date = NaiveDate::parse_from_str(&to_date, "%Y-%m-%d")
        .map_err(|e| ErrorResponseWithMessage::new(e.to_string()))?;
    let raw_groceries = get_groceries(&state.db, start_date, end_date)
        .await
        .map_err(|e| e.to_string())?
        .into_iter()
        .map(|i| Ingredient {
            name: i.name,
            amount: i.amount,
            unit: i.unit,
        })
        .collect::<Vec<Ingredient>>();
    let merged_groceries = merge(&raw_groceries);
    Ok(GenericResponse {
        data: merged_groceries,
    })
}
