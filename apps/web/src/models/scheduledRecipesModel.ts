import { DBScheduledRecipe } from '@/types/db/DBRecipe';

/**
 * Parse a DBScheduledRecipe row returned from the database into a application-friendly
 * scheduled recipe object used by the application.
 *
 * @param recipe - The database scheduled recipe row to convert.
 * @returns An object containing:
 *  - `scheduleId`: the schedule identifier
 *  - `recipeId`: the associated recipe identifier
 *  - `recipeTitle`: the title of the scheduled recipe
 *  - `recipeColor`: the color associated with the recipe
 *  - `scheduledDate`: the scheduled date as a JavaScript Date object
 */
export const parseScheduledRecipe = (recipe: DBScheduledRecipe) => ({
  scheduleId: recipe?.schedule_id,
  recipeId: recipe?.recipe_id,
  recipeTitle: recipe?.recipe_title,
  recipeColor: recipe?.recipe_color,
  scheduledDate: new Date(recipe?.scheduled_date)
});
