import { getRecipeSchedules } from '@/services/recipeService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const scheduledRecipes = await getRecipeSchedules(
      req.headers.get('Authorization'),
      id
    );
    return NextResponse.json(
      {
        data: scheduledRecipes
      },
      { status: 200 }
    );
  } catch (e: any) {
    return getErrorResponse(e as PostgrestError);
  }
}
