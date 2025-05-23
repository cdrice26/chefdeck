import { requireAuth } from '@/utils/requireAuth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({ data: { user } });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
