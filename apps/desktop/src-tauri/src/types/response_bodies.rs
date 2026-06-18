use crate::types::raw_db::RawRecipeCommon;
use chrono::NaiveDate;
use serde::{Deserialize, Serialize, Serializer};

fn serialize_date_with_time<S>(date: &NaiveDate, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    // Append 00:00:00 so JS parses it as local time, not UTC midnight
    s.serialize_str(&format!("{} 00:00:00", date))
}

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Repeat {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "weekly")]
    Weekly,
    #[serde(rename = "monthly date")]
    MonthlyDate,
    #[serde(rename = "monthly day")]
    MonthlyDay,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Schedule {
    pub id: i64,
    pub recipe_id: i64,
    #[serde(serialize_with = "serialize_date_with_time")]
    pub date: NaiveDate,
    pub repeat: Repeat,
    #[serde(serialize_with = "serialize_date_with_time")]
    pub end_repeat: NaiveDate,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScheduleDisplay {
    pub schedule_id: i64,
    pub recipe_id: i64,
    pub recipe_title: String,
    pub recipe_color: String,
    pub scheduled_date: NaiveDate,
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
