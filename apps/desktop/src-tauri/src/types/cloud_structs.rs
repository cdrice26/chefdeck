use chrono::NaiveDateTime;
use serde::Deserialize;

use crate::types::response_bodies::Ingredient;

/// Represents the form data for creating a new recipe in the cloud database.
#[derive(Debug, Clone)]
pub struct RecipeFormData {
    pub title: String,
    pub yield_value: u32,
    pub time: u32,
    pub image_path: Option<String>,
    pub color: String,
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<String>,
    pub tags: Vec<String>,
    pub source_url: Option<String>,
    pub last_viewed: Option<String>,
    pub last_updated: Option<String>,
    pub cloud_parent_id: Option<String>,
}

/// Represents a downloaded cloud recipe.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadedRecipe {
    pub id: String,
    pub title: String,
    pub yield_value: u32,
    pub time: u32,
    pub image_path: Option<String>,
    pub color: String,
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<String>,
    pub tags: Vec<String>,
    pub source_url: Option<String>,
    pub last_viewed: Option<String>,
    pub last_updated: Option<String>,
}

/// Represents a local recipe.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalRecipe {
    pub id: i64,
    pub title: String,
    pub yield_value: u32,
    pub time: u32,
    pub image_path: Option<String>,
    pub color: String,
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<String>,
    pub tags: Vec<String>,
    pub source_url: Option<String>,
    pub last_viewed: Option<String>,
    pub last_updated: Option<String>,
    pub cloud_parent_id: Option<String>,
}

impl RecipeFormData {
    pub fn into_local_recipe(self, id: i64) -> LocalRecipe {
        LocalRecipe {
            id,
            title: self.title,
            yield_value: self.yield_value,
            time: self.time,
            image_path: self.image_path,
            color: self.color,
            ingredients: self.ingredients,
            directions: self.directions,
            tags: self.tags,
            source_url: self.source_url,
            last_viewed: self.last_viewed,
            last_updated: self.last_updated,
            cloud_parent_id: None,
        }
    }
}

impl DownloadedRecipe {
    pub fn into_form_data(self) -> RecipeFormData {
        RecipeFormData {
            title: self.title,
            yield_value: self.yield_value,
            time: self.time,
            image_path: self.image_path,
            color: self.color,
            ingredients: self.ingredients,
            directions: self.directions,
            tags: self.tags,
            source_url: self.source_url,
            last_viewed: self.last_viewed,
            last_updated: self.last_updated,
            cloud_parent_id: Some(self.id),
        }
    }

    pub fn into_local_recipe(self, id: i64) -> LocalRecipe {
        LocalRecipe {
            id,
            title: self.title,
            yield_value: self.yield_value,
            time: self.time,
            image_path: self.image_path,
            color: self.color,
            ingredients: self.ingredients,
            directions: self.directions,
            tags: self.tags,
            source_url: self.source_url,
            last_viewed: self.last_viewed,
            last_updated: self.last_updated,
            cloud_parent_id: Some(self.id),
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewRecipeResponse {
    pub recipe_id: String,
}

#[derive(Debug, Deserialize)]
pub struct RecipeExistenceRecord {
    pub id: String,
    pub is_extant: bool,
}

#[derive(Debug, Deserialize, sqlx::FromRow)]
pub struct LastSyncedRecord {
    pub last_synced: Option<NaiveDateTime>,
}
