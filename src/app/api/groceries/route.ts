import { getGroceries } from '@/services/groceriesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles GET requests for groceries within a specified date range.
 *
 * Expects `fromDate` and `toDate` as query parameters in the request URL.
 * Authenticates the request and fetches groceries data for the given date range.
 * Returns a JSON response with the groceries data or an error response.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a Next.js response object.
 *
 * @example
 * // GET /api/groceries?fromDate=2024-06-01&toDate=2024-06-07
 * // Response: { data: [...] }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const start = new Date(searchParams.get('fromDate') ?? '');
  const end = new Date(searchParams.get('toDate') ?? '');

  try {
    const groceries = await getGroceries(await getAccessToken(req), start, end);
    return NextResponse.json({ data: groceries }, { status: 200 });
  } catch (err) {
    return getErrorResponse(err as PostgrestError);
  }
}
