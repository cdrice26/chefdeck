import { Ingredient } from '@/types/Recipe';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { merge } from 'groceryify';

/**
 * Fetch merged groceries for the authenticated user between two dates.
 *
 * This function:
 *  - Initializes a Supabase client using the provided auth token,
 *  - Ensures the user is authenticated,
 *  - Calls the `get_groceries` RPC to retrieve raw grocery items for the user in the given date range,
 *  - Posts the retrieved items to an external merge-ingredients API to aggregate quantities,
 *  - Returns the JSON payload returned by the external API.
 *
 * @param authToken - The authentication token used to initialize the Supabase client. May be null.
 * @param fromDate - Start date (inclusive) for the grocery query.
 * @param toDate - End date (inclusive) for the grocery query.
 * @returns A promise resolving to the JSON response returned by the merge-ingredients API. Throws a PostgrestError on authentication, RPC, or external API failures.
 */
export const getGroceries = async (
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
  const { data, error } = await supabase.rpc('get_groceries', {
    p_user_id: user?.id,
    p_start_date: fromDate,
    p_end_date: toDate
  });
  if (error) throw error;
  const toSend = data.map((grocery: Ingredient) => ({
    name: grocery.name,
    amount: grocery.amount,
    unit: grocery.unit
  }));
  return await merge(toSend);
};
