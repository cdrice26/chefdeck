import { getRecipe } from '@/services/recipeService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles GET requests to fetch a recipe by its ID.
 *
 * This function validates the presence of the recipe ID, fetches the recipe data using the provided ID and access token,
 * and returns the recipe data in the response. If the ID is missing or an error occurs during the fetch, it returns
 * an appropriate error response.
 *
 * @param {NextRequest} req - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @returns {Promise<NextResponse>} A response containing the recipe data or an error response.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }
  try {
    const recipe = await getRecipe(await getAccessToken(req), id);
    return NextResponse.json({ data: { recipe } }, { status: 200 });
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
