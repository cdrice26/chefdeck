use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub id: Option<i64>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Direction {
    pub id: Option<i64>,
    pub content: String,
}

#[derive(sqlx::FromRow, Debug)]
pub struct RawRecipe {
    pub id: Option<i64>,
    pub title: Option<String>,
    #[sqlx(rename = "yield")]
    pub r#yield: Option<i64>,
    pub minutes: Option<i64>,
    pub img_url: Option<String>,
    pub source: Option<String>,
    pub color: Option<String>,
    pub last_viewed: Option<chrono::NaiveDateTime>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RecipeTag {
    pub id: Option<i64>,
    pub name: Option<String>,
}

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
}
