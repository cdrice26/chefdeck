import { requireAuth } from '@/utils/requireAuth';
import createClient from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await requireAuth();

  const { username } = await request.json();

  const supabase = await createClient();
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
