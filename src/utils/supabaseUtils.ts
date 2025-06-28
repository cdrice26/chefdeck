import { createClient } from '@supabase/supabase-js';

export const createClientWithToken = (accessToken: string) =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });

export const createClientFromHeaders = (authHeader: string | null) =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: authHeader ?? ''
      }
    }
  });
