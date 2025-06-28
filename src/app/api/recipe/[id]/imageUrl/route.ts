import { getRecipeImageUrl } from '@/services/recipeService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id: recipeId } = await params;
  if (!recipeId) {
    return new Response('Recipe ID is required', { status: 400 });
  }
  try {
    const signedUrl = await getRecipeImageUrl(
      req.headers.get('Authorization'),
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
