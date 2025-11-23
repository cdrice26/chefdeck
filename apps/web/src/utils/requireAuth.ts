import { User } from '@supabase/supabase-js';
import { createClientWithToken } from './supabaseUtils';

/**
 * Ensure a server-side request is authenticated and return the Supabase user.
 *
 * This helper initializes a Supabase client using the provided access token,
 * attempts to read the current session/user, and throws an error when the
 * request is not authenticated. Callers can use this in server-side logic to
 * enforce authentication.
 *
 * @param authToken - Optional access token used to initialize the Supabase client.
 * @returns {Promise<User>} A Promise that resolves to the authenticated Supabase `User`.
 * @throws Error when authentication fails or no user is present (the thrown error may be a Supabase/PostgREST error).
 */
export async function requireAuth(authToken: string | null): Promise<User> {
  const supabase = createClientWithToken(authToken ?? '');
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // You can customize the error or response as needed
    const err = error ?? new Error('Unauthorized');
    err.name = 'Unauthorized';
    throw err;
  }

  return data.user;
}
