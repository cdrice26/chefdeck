import { NextRequest, NextResponse } from 'next/server';
import { getTags } from '@/services/tagsService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

export async function GET(req: NextRequest) {
  try {
    const tags = await getTags(await getAccessToken(req));
    return NextResponse.json(tags, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
