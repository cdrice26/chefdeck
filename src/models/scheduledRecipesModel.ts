import { DBScheduledRecipe } from '@/types/db/DBRecipe';

export const parseScheduledRecipe = (recipe: DBScheduledRecipe) => ({
  scheduleId: recipe?.schedule_id,
  recipeId: recipe?.recipe_id,
  recipeTitle: recipe?.recipe_title,
  scheduledDate: new Date(recipe?.scheduled_date)
});
