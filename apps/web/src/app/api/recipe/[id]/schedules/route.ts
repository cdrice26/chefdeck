import { getRecipeSchedules } from '@/services/recipeService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles GET requests for the times a recipe is scheduled.
 *
 * Expects `id` as a path parameter.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a Next.js response object.
 *
 * @example
 * // GET /api/recipe/123/schedules
 * // Response: { data: [...] }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
