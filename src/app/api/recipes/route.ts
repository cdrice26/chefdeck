import { NextRequest, NextResponse } from 'next/server';
import { getRecipes } from '@/services/recipesService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

export async function GET(req: NextRequest) {
  try {
    const recipes = await getRecipes(await getAccessToken(req));
    if (!recipes) {
      return NextResponse.json(
        { data: [] },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    return NextResponse.json(
      { data: recipes },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
