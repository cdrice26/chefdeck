import { getAccessToken } from '@/utils/authUtils';
import { requireAuth } from '@/utils/requireAuth';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const user = await requireAuth('Bearer ' + (await getAccessToken(request)));

  const { username } = await request.json();

  const supabase = createClientWithToken(await getAccessToken(request));
  const { error } = await supabase.rpc('upsert_profile', {
    p_user_id: user?.id,
    p_username: username
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Profile updated successfully',
    data: { username }
  });
}
