import { NextRequest, NextResponse } from 'next/server';
import { getRecipes } from '@/services/recipesService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

/**
 * GET handler for listing recipes.
 *
 * Accepts the following query parameters on the request URL:
 * - `page` (number, optional) — page number for pagination (defaults to 1)
 * - `limit` (number, optional) — number of items per page (defaults to 20)
 * - `q` (string, optional) — search query string
 * - `tags` (comma-separated string, optional) — list of tag slugs to filter by
 *
 * The handler requires an access token (extracted from the incoming request)
 * and delegates to `getRecipes` to fetch recipe data. On success it returns a
 * JSON response with a `data` property containing the recipes. If no recipes
 * are found it returns a 404 with an empty `data` array. Errors are forwarded
 * to the project's error utility for consistent error responses.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A Next.js JSON response containing the recipes or an error payload.
 *
 * @example
 * // GET /api/recipes?page=2&limit=10&q=pasta&tags=italian,quick
 * // Response: { data: [...] }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
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
