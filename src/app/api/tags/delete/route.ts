import { deleteTag } from '@/services/tagsService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
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
