import { getAccessToken } from '@/utils/authUtils';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClientWithToken(await getAccessToken(req));
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
  const response = NextResponse.json({ message: 'success' });

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}
