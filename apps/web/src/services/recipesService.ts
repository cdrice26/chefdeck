import { parseRecipe } from '@/models/recipeModel';
import { parseScheduledRecipe } from '@/models/scheduledRecipesModel';
import { DBScheduledRecipe } from '@/types/db/DBRecipe';
import { Recipe } from '@/types/Recipe';
import { asyncMap } from 'chefdeck-shared/server';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { PostgrestError } from '@supabase/supabase-js';

type GetRecipesOptions = {
  page: number;
  limit: number;
  q?: string;
  tags?: string[];
};

/**
 * Check the existence of recipe IDs.
 *
 * This function initializes a Supabase client using the provided auth token,
 * calls a stored procedure to check the existence of recipe IDs, and returns
 * an array of booleans indicating the existence of each recipe ID.
 *
 * @param authToken - The authentication used to initialize the Supabase client
 * @param ids - An array of recipe IDs to check existence for
 * @returns An array of records with `id` and `is_extant` properties indicating
 * the existence of each recipe ID
 */
export const checkExistence = async (
  authToken: string | null,
  ids: string[]
) => {
  const client = createClientWithToken(authToken ?? '');
  const { data, error } = await client.rpc('check_recipe_existence', {
    p_recipe_ids: ids
  });
  if (error) throw error;
  return data;
};

/**
 * Retrieve a paginated list of recipes for the authenticated user.
 *
 * This function initializes a Supabase client using the provided auth token,
 * validates that a user is present, calls a stored procedure to fetch recipes
 * with optional search and tag filters, parses the DB rows into application
 * Recipe objects using `parseRecipe`, and returns the resulting array.
 *
 * @param authToken - The authentication token used to initialize the Supabase client (may be null).
 * @param options - Pagination and filter options:
 *   - page: page number to fetch
 *   - limit: number of items per page
 *   - q: optional search query
 *   - tags: optional array of tags to filter by
 * @returns Promise resolving to an array of parsed `Recipe` objects.
 * @throws PostgrestError when the user is not authenticated or when the RPC reports an error.
 */
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

/**
 * Retrieve scheduled recipes for the authenticated user within a date range.
 *
 * Uses the provided auth token to initialize Supabase, validates the user,
 * calls the `get_scheduled_recipes` RPC, and maps each returned DB row to the
 * application's scheduled recipe representation via `parseScheduledRecipe`.
 *
 * @param authToken - The authentication token used to initialize the Supabase client (may be null).
 * @param fromDate - Inclusive start date for the scheduled recipe query.
 * @param toDate - Inclusive end date for the scheduled recipe query.
 * @returns Promise resolving to an array of parsed scheduled recipe objects.
 * @throws PostgrestError when the user is not authenticated or when the RPC reports an error.
 */
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
