import { parseSchedules } from '@/models/recipeModel';
import { createClientWithToken } from '@/utils/supabaseUtils';

/**
 * Fetch schedules associated with the authenticated user.
 *
 * @param authToken - The authentication token to initialize the Supabase client.
 * @returns A Promise resolving to an array of Schedule objects.
 * @throws PostgrestError when the underlying RPC call fails.
 */
export const getSchedules = async (authToken: string | null) => {
  const supabase = createClientWithToken(authToken ?? '');
  const { data, error } = await supabase.rpc('get_all_schedules');
  if (error) {
    throw error;
  }
  return parseSchedules(data);
};
