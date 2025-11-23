import { deleteRecipe } from '@/services/recipeService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles DELETE requests for recipes.
 *
 * Expects `id` as a path parameter in the request URL.
 * Authenticates the request and deletes the recipe with the given ID.
 * Returns a JSON response with a success message or an error response.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a Next.js response object.
 *
 * @example
 * // DELETE /api/recipe/123
 * // Response: { data: { message: 'Recipe Deleted Successfully.' } }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }

  try {
    await deleteRecipe(await getAccessToken(req), id);
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }

  return NextResponse.json({
    data: { message: 'Recipe Deleted Successfully.' }
  });
}
