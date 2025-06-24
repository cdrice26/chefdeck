import { SupabaseClient } from '@supabase/supabase-js';
import fetchImageUrl from '../utils/supabase/fetchImageUrl';
import { Recipe } from '@/types/Recipe';
import { isValidColor } from '../utils/styles/colorUtils';

/**
 * Converts a database recipe into a recipe object the application can use
 * @param supabase - Supabase client to use to fetch the image URL
 * @returns A function that takes a DBRecipe and outputs a Recipe that can be used by the application
 */
const parseRecipe =
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
      .sort((a, b) => a.sequence - b.sequence)
      .map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit
      })),
    directions: recipe.directions
      .sort((a, b) => a.sequence - b.sequence)
      .map((direction: any) => ({
        id: direction.id,
        content: direction.content
      })),
    lastViewed: recipe?.last_viewed,
    tags: recipe?.tags
  });

export default parseRecipe;
