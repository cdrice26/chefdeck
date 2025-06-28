import { createClientFromHeaders } from '@/utils/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClientFromHeaders(req.headers.get('Authorization'));
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
  return NextResponse.json({ message: 'success' }, { status: 200 });
}
