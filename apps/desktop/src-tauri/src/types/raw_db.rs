use std::path::PathBuf;

use crate::types::cloud_structs::{LocalRecipe, RecipeFormData};

use super::{
    parser::Parsable,
    response_bodies::{Direction, Ingredient, Recipe, RecipeTag},
};
use chrono::NaiveDateTime;

/// Represents an integer value from a pair in the key-value table
#[derive(sqlx::FromRow, Debug)]
pub struct IntegerValue {
    pub value: Option<i64>,
}

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
    pub last_viewed: Option<NaiveDateTime>,
}

/// Represents a recipe as it exists in the local database, with update information for syncing.
#[derive(sqlx::FromRow, Debug, Clone)]
pub struct RawRecipeSyncable {
    pub id: Option<i64>,
    pub title: Option<String>,
    #[sqlx(rename = "yield")]
    pub r#yield: Option<i64>,
    pub minutes: Option<i64>,
    pub img_url: Option<String>,
    pub source: Option<String>,
    pub color: Option<String>,
    pub last_updated: Option<NaiveDateTime>,
    pub cloud_recipe_id: Option<String>,
    pub last_viewed: Option<NaiveDateTime>,
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
    fn last_viewed(&self) -> Option<NaiveDateTime> {
        None
    }
    fn last_updated(&self) -> Option<NaiveDateTime> {
        None
    }
    fn cloud_parent_id(&self) -> Option<String> {
        None
    }
}

impl RawRecipe {
    pub fn into_syncable(self, cloud_recipe_id: Option<String>) -> RawRecipeSyncable {
        RawRecipeSyncable {
            cloud_recipe_id,
            last_updated: None,
            last_viewed: None,
            id: self.id,
            title: self.title,
            r#yield: self.r#yield,
            minutes: self.minutes,
            img_url: self.img_url,
            source: self.source,
            color: self.color,
        }
    }
}

impl RawRecipeCommon for RawRecipe {
    fn id(&self) -> Option<i64> {
        self.id
    }
    fn title(&self) -> Option<String> {
        self.title.clone()
    }
    fn yield_(&self) -> Option<i64> {
        self.r#yield
    }
    fn minutes(&self) -> Option<i64> {
        self.minutes
    }
    fn img_url(&self) -> Option<String> {
        self.img_url.clone()
    }
    fn source(&self) -> Option<String> {
        self.source.clone()
    }
    fn color(&self) -> Option<String> {
        self.color.clone()
    }
}

impl RawRecipeCommon for RawRecipeWithLastViewed {
    fn id(&self) -> Option<i64> {
        self.id
    }
    fn title(&self) -> Option<String> {
        self.title.clone()
    }
    fn yield_(&self) -> Option<i64> {
        self.r#yield
    }
    fn minutes(&self) -> Option<i64> {
        self.minutes
    }
    fn img_url(&self) -> Option<String> {
        self.img_url.clone()
    }
    fn source(&self) -> Option<String> {
        self.source.clone()
    }
    fn color(&self) -> Option<String> {
        self.color.clone()
    }

    fn last_viewed(&self) -> Option<NaiveDateTime> {
        self.last_viewed
    }
}

impl RawRecipeCommon for RawRecipeSyncable {
    fn id(&self) -> Option<i64> {
        self.id
    }
    fn title(&self) -> Option<String> {
        self.title.clone()
    }
    fn yield_(&self) -> Option<i64> {
        self.r#yield
    }
    fn minutes(&self) -> Option<i64> {
        self.minutes
    }
    fn img_url(&self) -> Option<String> {
        self.img_url.clone()
    }
    fn source(&self) -> Option<String> {
        self.source.clone()
    }
    fn color(&self) -> Option<String> {
        self.color.clone()
    }

    fn last_updated(&self) -> Option<NaiveDateTime> {
        self.last_updated
    }

    fn last_viewed(&self) -> Option<NaiveDateTime> {
        self.last_viewed
    }

    fn cloud_parent_id(&self) -> Option<String> {
        self.cloud_recipe_id.clone()
    }
}

/// Represents the context for parsing a recipe from the local database.
pub struct RecipeContext {
    pub recipe_id: i64,
    pub ingredients: Vec<Ingredient>,
    pub directions: Vec<Direction>,
    pub tags: Vec<RecipeTag>,
    pub images_lib_path: PathBuf,
}

impl RecipeContext {
    pub fn from_form_data(recipe_form_data: &(impl RawRecipeCommon + HasRecipeContext)) -> Self {
        Self {
            recipe_id: recipe_form_data.id().unwrap_or(0),
            ingredients: recipe_form_data.ingredients().to_vec(),
            directions: recipe_form_data
                .directions()
                .to_vec()
                .into_iter()
                .map(|d| Direction::from_string(d))
                .collect(),
            tags: recipe_form_data
                .tags()
                .to_vec()
                .into_iter()
                .map(|t| RecipeTag::from_string(t))
                .collect(),
            images_lib_path: PathBuf::new(),
        }
    }
}

pub trait HasRecipeContext {
    fn ingredients(&self) -> Vec<Ingredient>;
    fn directions(&self) -> Vec<String>;
    fn tags(&self) -> Vec<String>;
}

impl HasRecipeContext for RecipeFormData {
    fn ingredients(&self) -> Vec<Ingredient> {
        self.ingredients.clone()
    }

    fn directions(&self) -> Vec<String> {
        self.directions.clone()
    }

    fn tags(&self) -> Vec<String> {
        self.tags.clone()
    }
}

impl HasRecipeContext for LocalRecipe {
    fn ingredients(&self) -> Vec<Ingredient> {
        self.ingredients.clone()
    }

    fn directions(&self) -> Vec<String> {
        self.directions.clone()
    }

    fn tags(&self) -> Vec<String> {
        self.tags.clone()
    }
}

impl HasRecipeContext for Recipe {
    fn ingredients(&self) -> Vec<Ingredient> {
        self.ingredients.clone()
    }

    fn directions(&self) -> Vec<String> {
        self.directions
            .clone()
            .into_iter()
            .map(|d| d.content)
            .collect()
    }

    fn tags(&self) -> Vec<String> {
        self.tags
            .clone()
            .into_iter()
            .filter(|t| t.name.is_some())
            .map(|t| t.name.clone().unwrap())
            .collect()
    }
}

impl RawRecipeCommon for RecipeFormData {
    fn id(&self) -> Option<i64> {
        None
    }

    fn title(&self) -> Option<String> {
        Some(self.title.clone())
    }

    fn yield_(&self) -> Option<i64> {
        Some(self.yield_value as i64)
    }

    fn minutes(&self) -> Option<i64> {
        Some(self.time as i64)
    }

    fn img_url(&self) -> Option<String> {
        self.image_path.clone()
    }

    fn source(&self) -> Option<String> {
        self.source_url.clone()
    }

    fn color(&self) -> Option<String> {
        Some(self.color.clone())
    }

    fn last_viewed(&self) -> Option<NaiveDateTime> {
        if let Some(last_viewed) = &self.last_viewed {
            NaiveDateTime::parse_from_str(last_viewed, "%Y-%m-%d %H:%M:%S").ok()
        } else {
            None
        }
    }

    fn last_updated(&self) -> Option<NaiveDateTime> {
        if let Some(last_updated) = &self.last_updated {
            NaiveDateTime::parse_from_str(last_updated, "%Y-%m-%d %H:%M:%S").ok()
        } else {
            None
        }
    }

    fn cloud_parent_id(&self) -> Option<String> {
        self.cloud_parent_id.clone()
    }
}

impl RawRecipeCommon for LocalRecipe {
    fn id(&self) -> Option<i64> {
        Some(self.id)
    }

    fn title(&self) -> Option<String> {
        Some(self.title.clone())
    }

    fn yield_(&self) -> Option<i64> {
        Some(self.yield_value as i64)
    }

    fn minutes(&self) -> Option<i64> {
        Some(self.time as i64)
    }

    fn img_url(&self) -> Option<String> {
        self.image_path.clone()
    }

    fn source(&self) -> Option<String> {
        self.source_url.clone()
    }

    fn color(&self) -> Option<String> {
        Some(self.color.clone())
    }

    fn last_viewed(&self) -> Option<NaiveDateTime> {
        if let Some(last_viewed) = &self.last_viewed {
            NaiveDateTime::parse_from_str(last_viewed, "%Y-%m-%d %H:%M:%S").ok()
        } else {
            None
        }
    }

    fn last_updated(&self) -> Option<NaiveDateTime> {
        if let Some(last_updated) = &self.last_updated {
            NaiveDateTime::parse_from_str(last_updated, "%Y-%m-%d %H:%M:%S").ok()
        } else {
            None
        }
    }

    fn cloud_parent_id(&self) -> Option<String> {
        self.cloud_parent_id.clone()
    }
}

impl RawRecipeCommon for Recipe {
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
        self.img_url.clone()
    }

    fn source(&self) -> Option<String> {
        self.source_url.clone()
    }

    fn color(&self) -> Option<String> {
        Some(self.color.clone())
    }

    fn last_viewed(&self) -> Option<NaiveDateTime> {
        self.last_viewed
    }

    fn last_updated(&self) -> Option<NaiveDateTime> {
        self.last_updated
    }

    fn cloud_parent_id(&self) -> Option<String> {
        self.cloud_parent_id.clone()
    }
}

pub trait ToRecipeFormData: RawRecipeCommon + HasRecipeContext {
    fn into_recipe_form_data(&self) -> RecipeFormData {
        RecipeFormData {
            title: self.title().unwrap_or_default(),
            yield_value: self.yield_().unwrap_or_default() as u32,
            time: self.minutes().unwrap_or_default() as u32,
            image_path: self.img_url(),
            color: self.color().unwrap_or_default(),
            ingredients: self.ingredients().clone(),
            directions: self.directions().clone(),
            tags: self.tags().clone(),
            source_url: self.source().clone(),
            last_viewed: self
                .last_viewed()
                .map(|t| t.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
            last_updated: self
                .last_updated()
                .map(|t| t.format("%Y-%m-%dT%H:%M:%SZ").to_string()),
            cloud_parent_id: self.cloud_parent_id().clone(),
        }
    }
}

// Blanket impl for anything that satisfies both bounds
impl<T: RawRecipeCommon + HasRecipeContext> ToRecipeFormData for T {}

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
            img_url: match self.img_url() {
                Some(img_url) => Some(
                    context
                        .images_lib_path
                        .join(img_url)
                        .to_string_lossy()
                        .into_owned(),
                ),
                None => None,
            },
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

pub struct RawCloudId {
    pub cloud_recipe_id: String,
    pub username: String,
    pub recipe_id: Option<i64>,
}

pub struct CloudId {
    pub local_id: i64,
    pub cloud_id: String,
    pub username: String,
}

#[derive(Debug)]
pub struct TagCloudId {
    pub local_id: i64,
    pub username: String,
}
