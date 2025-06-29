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
    console.error('Could not refresh token.');
    return NextResponse.json(
      { error: { message: error?.message || 'Failed to refresh token' } },
      { status: 401 }
    );
  }

  const accessToken = data.session.access_token;
  const newRefreshToken = data.session.refresh_token;

  if (clientType !== 'web') {
    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  }

  const resp = NextResponse.json({ message: 'success' });
  resp.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60
  });
  resp.cookies.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });
  return resp;
}
