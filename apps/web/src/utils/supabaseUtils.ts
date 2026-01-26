import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client configured to include a Bearer access token in requests.
 *
 * This helper centralizes creation of the Supabase client so callers don't need
 * to repeatedly provide the URL/anon key and header configuration.
 *
 * @param accessToken - The access token string to include in the Authorization header. If empty, an unauthenticated client will be created.
 * @returns A Supabase client instance configured with the provided Authorization header.
 */
export const createClientWithToken = (accessToken: string) =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

/**
 * Create a Supabase client using a raw Authorization header value (for example, forwarded request headers).
 *
 * @param authHeader - The full Authorization header value (e.g. 'Bearer <token>') or null. If null, an empty header string will be used.
 * @returns A Supabase client instance configured with the provided Authorization header.
 */
export const createClientFromHeaders = (authHeader: string | null) =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: authHeader ?? ''
      }
    }
  });
