import { createClient, type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (!token_hash || !type) {
    return NextResponse.json(
      { error: 'Missing token or type.' },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
  const session = data?.session;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // For password reset, client should show a password reset form.
  // For signup/email change, client can show a success message.
  return NextResponse.json({
    message:
      type === 'recovery'
        ? 'Token valid, please set a new password.'
        : 'Confirmation successful.',
    type,
    accessToken: session?.access_token
  });
}
