import { checkExistence } from '@/services/recipesService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export default async function POST(req: NextRequest) {
  const body = await req.json();
  const { recipeIds } = body;
  try {
    const data = await checkExistence(await getAccessToken(req), recipeIds);
    return NextResponse.json({ data });
  } catch (error) {
    return getErrorResponse(error as PostgrestError);
  }
}
