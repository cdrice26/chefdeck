import { getSchedules } from '@/services/schedulesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const recipes = await getSchedules(await getAccessToken(req));
    return NextResponse.json({ data: recipes }, { status: 200 });
  } catch (err) {
    return getErrorResponse(err as PostgrestError);
  }
}
