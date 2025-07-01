import { DBScheduledRecipe } from '@/types/db/DBRecipe';

export const parseScheduledRecipe = (recipe: DBScheduledRecipe) => ({
  scheduleId: recipe?.schedule_id,
  recipeId: recipe?.recipe_id,
  recipeTitle: recipe?.recipe_title,
  recipeColor: recipe?.recipe_color,
  scheduledDate: new Date(recipe?.scheduled_date)
});
