import createClient from './supabase/supabase';

/**
 * Checks if the request is authenticated using Supabase session.
 * If not authenticated, returns a 401 JSON response.
 * If authenticated, returns the user object.
 *
 * @returns {Promise<object>} NextResponse if unauthorized, otherwise the user object.
 */
export async function requireAuth(): Promise<object> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}
