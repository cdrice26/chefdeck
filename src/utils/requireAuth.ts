import { User } from '@supabase/supabase-js';
import { createClientFromHeaders } from './supabase/supabase';

/**
 * Checks if the request is authenticated using Supabase session.
 * If not authenticated, throws an error.
 * If authenticated, returns the user object.
 *
 * @returns {Promise<User>} NextResponse if unauthorized, otherwise the user object.
 */
export async function requireAuth(authHeader: string | null): Promise<User> {
  const supabase = createClientFromHeaders(authHeader);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // You can customize the error or response as needed
    const err = error ?? new Error('Unauthorized');
    err.name = 'Unauthorized';
    throw err;
  }

  return data.user;
}
