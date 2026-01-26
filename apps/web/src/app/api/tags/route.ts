import { NextRequest, NextResponse } from 'next/server';
import { getTags } from '@/services/tagsService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

/**
 * GET /api/tags
 *
 * Retrieves the list of tags available to the authenticated user.
 *
 * Behavior:
 * - Requires an access token extracted from the incoming request via `getAccessToken`.
 * - Delegates to `getTags` to fetch tag data from the service layer.
 * - Returns a JSON response containing the tags and sets `Cache-Control: no-cache`
 *   to ensure the client receives fresh data.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A JSON response with the tags or an error payload formatted by `getErrorResponse`.
 *
 * @example
 * // GET /api/tags
 * // Response: [{ id: '1', value: 'italian' }, ...]
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const tags = await getTags(await getAccessToken(req));
    return NextResponse.json(tags, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // No caching for GET requests to ensure fresh data
      }
    });
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
