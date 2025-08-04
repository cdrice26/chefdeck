import { getGroceries } from '@/services/groceriesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const start = new Date(searchParams.get('fromDate') ?? '');
  const end = new Date(searchParams.get('toDate') ?? '');

  try {
    const groceries = await getGroceries(await getAccessToken(req), start, end);
    return NextResponse.json({ data: groceries }, { status: 200 });
  } catch (err) {
    return getErrorResponse(err as PostgrestError);
  }
}
