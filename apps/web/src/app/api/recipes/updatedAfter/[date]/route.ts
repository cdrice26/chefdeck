import { getRecipesUpdatedAfter } from '@/services/recipesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles GET requests to fetch recipes updated after a given date.
 *
 * @param req The incoming request object.
 * @param param1 The route parameters, including the `date` string.
 * @returns A JSON response with the fetched recipes or an error response.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const updatedAfter = new Date(date);
  try {
    const data = await getRecipesUpdatedAfter(
      await getAccessToken(req),
      updatedAfter
    );
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return getErrorResponse(error as PostgrestError);
  }
}
