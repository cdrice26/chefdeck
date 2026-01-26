import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.headers
      .get('Authorization')
      ?.replace('Bearer ', '');
    const { password } = await req.json();

    if (!accessToken || !password) {
      return NextResponse.json(
        { error: 'Missing token or password.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/user?apikey=${process.env.SUPABASE_ANON_KEY}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to update password.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Password reset successfully.' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
