import { getScheduledRecipes } from '@/services/recipesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles GET requests for scheduled recipes within a specified date range.
 *
 * Expects `startDate` and `endDate` as query parameters in the request URL.
 * Requires authentication via access token.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} - A JSON response containing the scheduled recipes data,
 *   or an error response if the operation fails.
 *
 * @example
 * // GET /api/recipes/scheduled?startDate=2024-06-01&endDate=2024-06-30
 * // Response: { data: [...] }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
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
