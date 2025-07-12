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
 * Converts a database recipe into a recipe object the application can use
 * @param supabase - Supabase client to use to fetch the image URL
 * @returns A function that takes a DBRecipe and outputs a Recipe that can be used by the application
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

export const parseSchedules = (schedules: DBSchedule[]): Schedule[] =>
  schedules?.map((schedule) => ({
    id: schedule.id,
    recipeId: schedule.recipe_id,
    date: schedule.date,
    repeat: isValidRepeat(schedule.repeat) ? schedule.repeat : 'none',
    endRepeat: schedule.repeat_end
  }));
