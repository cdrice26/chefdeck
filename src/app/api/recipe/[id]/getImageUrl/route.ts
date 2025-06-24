import { getRecipeImageUrl } from '@/services/recipeService';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { recipeId } = await params;
  if (!recipeId) {
    return new Response('Recipe ID is required', { status: 400 });
  }
  try {
    const signedUrl = await getRecipeImageUrl(recipeId);
    return new Response(signedUrl, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error: any) {
    if (error.code === '404') {
      return new Response(error.message, { status: 404 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
