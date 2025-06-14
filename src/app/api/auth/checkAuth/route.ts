import { requireAuth } from '@/utils/requireAuth';
import createClient from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_profile', {
      current_user_id: user.id
    });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: { user, profile: { username: data } } });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
