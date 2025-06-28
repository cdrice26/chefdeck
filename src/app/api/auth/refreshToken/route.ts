import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRefreshToken } from '@/utils/authUtils';

export async function POST(req: NextRequest) {
  const clientType = req.headers.get('X-Client-Type');

  const refreshToken = await getRefreshToken(req);

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Missing refresh token' },
      { status: 400 }
    );
  }

  // Create a Supabase client (no session/cookies, just anon key)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  // Use Supabase to refresh the session using the refresh token
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error || !data.session?.access_token) {
    return NextResponse.json(
      { error: { message: error?.message || 'Failed to refresh token' } },
      { status: 401 }
    );
  }

  return clientType === 'web'
    ? NextResponse.json({ message: 'success' })
    : NextResponse.json({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
      });
}
