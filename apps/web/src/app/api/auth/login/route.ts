import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Handles POST requests for user login.
 *
 * Expects a JSON body with `email` and `password` fields.
 * Returns a JSON response with user and session data if authentication is successful,
 * or an error message with the appropriate status code if authentication fails.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing authentication result.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();
    const clientType = req.headers.get('X-Client-Type');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message ?? 'Login failed' },
        { status: 401 }
      );
    }

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    const resp = NextResponse.json({
      data:
        clientType === 'web'
          ? { user: data.user }
          : {
              user: data.user,
              accessToken,
              refreshToken
            }
    });

    resp.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60
    });
    resp.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return resp;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
