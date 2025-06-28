import { NextRequest, NextResponse } from 'next/server';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { getAccessToken } from '@/utils/authUtils';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClientWithToken(await getAccessToken(req));

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: username, error: profileError } = await supabase.rpc(
      'get_profile',
      {
        current_user_id: user.id
      }
    );

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { user, profile: { username } }
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
