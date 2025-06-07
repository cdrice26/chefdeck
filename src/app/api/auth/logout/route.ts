import createClient from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
  return NextResponse.json({ message: 'success' }, { status: 200 });
}
