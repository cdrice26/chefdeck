import { getScheduledRecipes } from '@/services/recipesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const start = new Date(searchParams.get('startDate') ?? '');
  const end = new Date(searchParams.get('endDate') ?? '');
  try {
    const recipes = await getScheduledRecipes(
      await getAccessToken(req),
      start,
      end
    );
    return NextResponse.json({ data: recipes }, { status: 200 });
  } catch (err) {
    return getErrorResponse(err as PostgrestError);
  }
}
