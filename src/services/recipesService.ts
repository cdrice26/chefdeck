import { parseRecipe } from '@/models/recipeModel';
import { parseScheduledRecipe } from '@/models/scheduledRecipesModel';
import { DBScheduledRecipe } from '@/types/db/DBRecipe';
import { Recipe } from '@/types/Recipe';
import { asyncMap } from '@/utils/arrayUtils';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { PostgrestError } from '@supabase/supabase-js';

type GetRecipesOptions = {
  page: number;
  limit: number;
  q?: string;
  tags?: string[];
};

export const getRecipes = async (
  authToken: string | null,
  options: GetRecipesOptions = { page: 1, limit: 20 }
) => {
  const { page, limit, q, tags } = options;
  const supabase = createClientWithToken(authToken ?? '');
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user === null) {
    throw new PostgrestError({
      message: 'Unauthorized',
      code: '401',
      details: 'User is not authenticated',
      hint: 'Please log in to access your recipes'
    });
  }

  // Call your stored procedure instead of querying the table directly
  const { data, error } = await supabase.rpc('get_recipes', {
    p_user_id: user.id,
    p_page: page,
    p_limit: limit,
    p_q: q || null,
    p_tags: tags && tags.length > 0 ? tags : null
  });

  const recipes: Recipe[] =
    data && data?.length > 0 ? await asyncMap(data, parseRecipe(supabase)) : [];
  if (error) {
    throw new PostgrestError({
      message: 'Error fetching recipes',
      code: '500',
      details: error.message,
      hint: 'Please try again later'
    });
  }
  return recipes;
};

export const getScheduledRecipes = async (
  authToken: string | null,
  fromDate: Date,
  toDate: Date
) => {
  const supabase = createClientWithToken(authToken ?? '');
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user === null) {
    throw new PostgrestError({
      message: 'Unauthorized',
      code: '401',
      details: 'User is not authenticated',
      hint: 'Please log in to access your recipes'
    });
  }
  const { data, error } = await supabase.rpc('get_scheduled_recipes', {
    p_user_id: user?.id,
    p_start_date: fromDate,
    p_end_date: toDate
  });
  if (error) throw error;
  return data.map((recipe: DBScheduledRecipe) => parseScheduledRecipe(recipe));
};
