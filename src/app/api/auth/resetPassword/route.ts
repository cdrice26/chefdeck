import { NextRequest, NextResponse } from 'next/server';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { getAccessToken } from '@/utils/authUtils';

export async function POST(req: NextRequest) {
  try {
    const { token_hash, password } = await req.json();

    if (!token_hash || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required.' },
        { status: 400 }
      );
    }

    const supabase = createClientWithToken(await getAccessToken(req));

    // Use the token to update the user's password
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
