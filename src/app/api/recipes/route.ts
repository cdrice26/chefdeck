import { NextRequest, NextResponse } from 'next/server';
import { getRecipes } from '@/services/recipesService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const q = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    const recipes = await getRecipes(await getAccessToken(req), {
      page,
      limit,
      q,
      tags
    });
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
    console.error('Error in GET /api/recipes:', error);
    return getErrorResponse(error as PostgrestError);
  }
}
