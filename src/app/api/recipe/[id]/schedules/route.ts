import { getRecipeSchedules } from '@/services/recipeService';
import { getAccessToken } from '@/utils/authUtils';
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
      await getAccessToken(req),
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
