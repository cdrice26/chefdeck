use serde::{Deserialize, Serialize};

/// Represents an ingredient.
#[derive(Deserialize, Serialize, Debug)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub id: Option<i64>,
}

/// Represents a direction.
#[derive(Deserialize, Serialize, Debug)]
pub struct Direction {
    pub id: Option<i64>,
    pub content: String,
}

/// Represents a keyword tag on a recipe.
#[derive(Deserialize, Serialize, Debug)]
pub struct RecipeTag {
    pub id: Option<i64>,
    pub name: Option<String>,
}

/// Represents a recipe.
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Recipe {
    pub id: Option<i64>,
    pub title: String,
    pub servings: i64,
    pub minutes: i64,
    pub img_url: Option<String>,
    pub source_url: Option<String>,
    pub color: String,
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<Direction>,
    pub tags: Vec<RecipeTag>,
    pub last_viewed: Option<chrono::NaiveDateTime>,
    pub last_updated: Option<chrono::NaiveDateTime>,
    pub cloud_parent_id: Option<String>,
}
