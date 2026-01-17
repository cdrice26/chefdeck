use crate::types::response_bodies::Ingredient;

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
}
