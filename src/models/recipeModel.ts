import { SupabaseClient } from '@supabase/supabase-js';
import fetchImageUrl from '../utils/imageUtils';
import { Recipe } from '@/types/Recipe';
import { isValidColor } from '../utils/styles/colorUtils';
import {
  DBDirection,
  DBIngredient,
  DBRecipe,
  DBSchedule
} from '@/types/db/DBRecipe';
import { isValidRepeat, Schedule } from '@/types/Schedule';

/**
 * Convert a DBRecipe into the application-friendly Recipe shape.
 *
 * This factory returns an async mapper function that transforms a database
 * recipe record (`DBRecipe`) into the application-level `Recipe`. The mapper
 * will fetch the image URL for the recipe using the provided Supabase client
 * and will normalize/validate fields (for example, ensuring a valid color and
 * sorting ingredients/directions by their sequence).
 *
 * @param supabase - SupabaseClient instance used to fetch image URLs for recipes.
 * @returns A function that accepts a DBRecipe and returns a Promise resolving to a Recipe.
 */
export const parseRecipe =
  (supabase: SupabaseClient) =>
  async (recipe: DBRecipe): Promise<Recipe> => ({
    id: recipe.id,
    title: recipe.title,
    servings: recipe.yield,
    minutes: recipe.minutes,
    imgUrl: await fetchImageUrl(supabase, recipe),
    sourceUrl: recipe.source,
    color: isValidColor(recipe.color) ? recipe.color : 'white',
    ingredients: recipe.ingredients
      ?.sort((a, b) => a.sequence - b.sequence)
      ?.map((ingredient: DBIngredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit
      })),
    directions: recipe.directions
      ?.sort((a, b) => a.sequence - b.sequence)
      ?.map((direction: DBDirection) => ({
        id: direction.id,
        content: direction.content
      })),
    lastViewed: recipe?.last_viewed,
    tags: recipe?.tags
  });

/**
 * Parse an array of DBSchedule records into Schedule objects used by the app.
 *
 * Converts raw schedule rows from the database into the application's Schedule
 * shape, validating the `repeat` value and converting field names to the
 * expected camelCase property names.
 *
 * @param schedules - Array of DBSchedule records from the database.
 * @returns An array of Schedule objects with normalized fields and validated repeat values.
 */
export const parseSchedules = (schedules: DBSchedule[]): Schedule[] =>
  schedules?.map((schedule) => ({
    id: schedule.id,
    recipeId: schedule.recipe_id,
    date: schedule.date,
    repeat: isValidRepeat(schedule.repeat) ? schedule.repeat : 'none',
    endRepeat: schedule.repeat_end
  }));
