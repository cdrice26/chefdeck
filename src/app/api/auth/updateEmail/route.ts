import { NextRequest, NextResponse } from 'next/server';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { getAccessToken } from '@/utils/authUtils';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create Supabase client with SSR cookies for authentication
    const supabase = createClientWithToken(await getAccessToken(req));

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update email
    const { error: updateError } = await supabase.auth.updateUser(
      {
        email
      },
      {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/confirm?type=email_change`
      }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
