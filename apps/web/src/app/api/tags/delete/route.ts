import { deleteTag } from '@/services/tagsService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/tags/delete
 *
 * Deletes a tag identified by the `tagValue` query parameter.
 *
 * Query parameters:
 * - `tagValue` (string, required): The value or identifier of the tag to delete.
 *
 * Authentication:
 * - Requires a valid access token extracted from the incoming request via `getAccessToken`.
 *
 * Responses:
 * - 200: Tag deleted successfully with a JSON message.
 * - Other: Errors are delegated to `getErrorResponse` which formats Postgrest errors.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A Next.js JSON response indicating success or an error payload.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    await deleteTag(
      await getAccessToken(req),
      req.nextUrl.searchParams.get('tagValue') || ''
    );
    return NextResponse.json(
      { message: 'Tag deleted successfully' },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache' // No caching for delete operations
        }
      }
    );
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
