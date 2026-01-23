use super::{
    parser::Parsable,
    response_bodies::{Direction, Ingredient, Recipe, RecipeTag},
};

/// Represents a recipe as it exists in the local database
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
}

/// Represents a recipe as it exists in the local database, with last viewed information.
#[derive(sqlx::FromRow, Debug)]
pub struct RawRecipeWithLastViewed {
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

/// Represents a recipe as it exists in the local database, with update information for syncing.
#[derive(sqlx::FromRow, Debug)]
pub struct RawRecipeSyncable {
    pub id: Option<i64>,
    pub title: Option<String>,
    #[sqlx(rename = "yield")]
    pub r#yield: Option<i64>,
    pub minutes: Option<i64>,
    pub img_url: Option<String>,
    pub source: Option<String>,
    pub color: Option<String>,
    pub last_updated: Option<chrono::NaiveDateTime>,
    pub cloud_recipe_id: Option<String>,
}

/// Represents a common trait for recipes in the local database.
pub trait RawRecipeCommon {
    fn id(&self) -> Option<i64>;
    fn title(&self) -> Option<String>;
    fn yield_(&self) -> Option<i64>;
    fn minutes(&self) -> Option<i64>;
    fn img_url(&self) -> Option<String>;
    fn source(&self) -> Option<String>;
    fn color(&self) -> Option<String>;

    // override these in specific types
    fn last_viewed(&self) -> Option<chrono::NaiveDateTime> {
        None
    }
    fn last_updated(&self) -> Option<chrono::NaiveDateTime> {
        None
    }
    fn cloud_parent_id(&self) -> Option<String> {
        None
    }
}

impl RawRecipeCommon for RawRecipe {
    fn id(&self) -> Option<i64> { self.id }
    fn title(&self) -> Option<String> { self.title.clone() }
    fn yield_(&self) -> Option<i64> { self.r#yield }
    fn minutes(&self) -> Option<i64> { self.minutes }
    fn img_url(&self) -> Option<String> { self.img_url.clone() }
    fn source(&self) -> Option<String> { self.source.clone() }
    fn color(&self) -> Option<String> { self.color.clone() }
}

impl RawRecipeCommon for RawRecipeWithLastViewed {
    fn id(&self) -> Option<i64> { self.id }
    fn title(&self) -> Option<String> { self.title.clone() }
    fn yield_(&self) -> Option<i64> { self.r#yield }
    fn minutes(&self) -> Option<i64> { self.minutes }
    fn img_url(&self) -> Option<String> { self.img_url.clone() }
    fn source(&self) -> Option<String> { self.source.clone() }
    fn color(&self) -> Option<String> { self.color.clone() }

    fn last_viewed(&self) -> Option<chrono::NaiveDateTime> {
        self.last_viewed
    }
}

impl RawRecipeCommon for RawRecipeSyncable {
    fn id(&self) -> Option<i64> { self.id }
    fn title(&self) -> Option<String> { self.title.clone() }
    fn yield_(&self) -> Option<i64> { self.r#yield }
    fn minutes(&self) -> Option<i64> { self.minutes }
    fn img_url(&self) -> Option<String> { self.img_url.clone() }
    fn source(&self) -> Option<String> { self.source.clone() }
    fn color(&self) -> Option<String> { self.color.clone() }

    fn last_updated(&self) -> Option<chrono::NaiveDateTime> {
        self.last_updated
    }

    fn cloud_parent_id(&self) -> Option<String> {
        self.cloud_recipe_id.clone()
    }
}

/// Represents the context for parsing a recipe from the local database.
pub struct RecipeContext {
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<Direction>,
    pub tags: Vec<RecipeTag>,
}

impl<T> Parsable for T
where
    T: RawRecipeCommon,
{
    type Output = Recipe;
    type Context = RecipeContext;

    /// Parses a RawRecipe into a Recipe using the provided context.
    ///
    /// # Arguments
    ///
    /// * `self` - The RawRecipe to parse.
    /// * `context` - The context to use for parsing.
    ///
    /// # Returns
    ///
    /// A Result containing the parsed Recipe or an sqlx::Error.
    fn parse(self, context: RecipeContext) -> Result<Self::Output, sqlx::Error> {
        Ok(Recipe {
            id: self.id(),
            title: self.title().unwrap_or_default(),
            servings: self.yield_().unwrap_or(0),
            minutes: self.minutes().unwrap_or(0),
            img_url: self.img_url(),
            source_url: self.source(),
            color: self.color().unwrap_or_default(),
            tags: context.tags,
            ingredients: context.ingredients,
            directions: context.directions,
            last_viewed: self.last_viewed(),
            last_updated: self.last_updated(),
            cloud_parent_id: self.cloud_parent_id(),
        })
    }
}
