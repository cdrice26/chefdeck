import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import createClient from '@/utils/supabase/supabase';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/static/confirmSuccess';

  if (token_hash && type) {
    const supabase = await createClient();

    const verifyParams: any = { type, token_hash };

    const { error } = await supabase.auth.verifyOtp(verifyParams);
    console.error(error);
    if (!error) {
      redirect(next);
    }
  }

  redirect('/static/error');
}
