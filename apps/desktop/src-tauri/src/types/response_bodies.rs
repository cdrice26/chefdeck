use crate::types::raw_db::RawRecipeCommon;
use serde::{Deserialize, Serialize};

/// Represents an ingredient.
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub id: Option<i64>,
}

/// Represents a direction.
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Direction {
    pub id: Option<i64>,
    pub content: String,
}

impl Direction {
    pub fn from_string(content: String) -> Self {
        Self {
            id: None,
            content: content,
        }
    }
}

/// Represents a keyword tag on a recipe.
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct RecipeTag {
    pub id: Option<i64>,
    pub name: Option<String>,
}

impl RecipeTag {
    pub fn from_string(name: String) -> Self {
        Self {
            id: None,
            name: Some(name),
        }
    }
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

impl RawRecipeCommon for &Recipe {
    fn id(&self) -> Option<i64> {
        self.id
    }

    fn title(&self) -> Option<String> {
        Some(self.title.clone())
    }

    fn yield_(&self) -> Option<i64> {
        Some(self.servings)
    }

    fn minutes(&self) -> Option<i64> {
        Some(self.minutes)
    }

    fn img_url(&self) -> Option<String> {
        self.img_url.as_deref().map(|s| s.to_string())
    }

    fn source(&self) -> Option<String> {
        self.source_url.as_deref().map(|s| s.to_string())
    }

    fn color(&self) -> Option<String> {
        Some(self.color.clone())
    }
}
