import { getRecipeImageUrl } from '@/services/recipeService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles GET requests for recipe image URL.
 *
 * Expects `recipeId` as a path parameter in the request URL.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a Next.js response object.
 *
 * @example
 * // GET /api/recipe/123/imageUrl
 * // Response: { data: [...] }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: any }
): Promise<NextResponse> {
  const { id: recipeId } = await params;
  if (!recipeId) {
    return new Response('Recipe ID is required', { status: 400 });
  }
  try {
    const signedUrl = await getRecipeImageUrl(
      await getAccessToken(req),
      recipeId
    );
    return new Response(signedUrl, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
