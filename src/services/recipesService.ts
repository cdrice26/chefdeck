import { parseRecipe } from '@/models/recipeModel';
import { Recipe } from '@/types/Recipe';
import { asyncMap } from '@/utils/arrayUtils';
import { createClientFromHeaders } from '@/utils/supabase/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export const getRecipes: (
  authHeader: string | null
) => Promise<Recipe[]> = async (authHeader: string | null) => {
  const supabase = createClientFromHeaders(authHeader);
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
  const { data, error } = await supabase.rpc('get_recipes', {
    in_user_id: user?.id
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
