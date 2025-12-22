use super::{parser::Parsable, response_bodies::{Direction, Ingredient, Recipe, RecipeTag}};

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

pub struct RecipeContext {
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<Direction>,
    pub tags: Vec<RecipeTag>,
}

impl Parsable for RawRecipe {
    type Output = Recipe;
    type Context = RecipeContext;

    fn parse(self, context: RecipeContext) -> Result<Self::Output, sqlx::Error> {
        let ingredients = context.ingredients;
        let directions = context.directions;
        let tags = context.tags;

        Ok(Recipe {
            id: self.id,
            title: self.title.unwrap_or_default(),
            servings: self.r#yield.unwrap_or(0),
            minutes: self.minutes.unwrap_or(0),
            img_url: self.img_url,
            source_url: self.source,
            color: self.color.unwrap_or_default(),
            tags,
            ingredients,
            directions,
            last_viewed: self.last_viewed,
        })
    }
}
