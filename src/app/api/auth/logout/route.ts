import { getAccessToken } from '@/utils/authUtils';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClientWithToken(await getAccessToken(req));
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
  return NextResponse.json({ message: 'success' }, { status: 200 });
}
