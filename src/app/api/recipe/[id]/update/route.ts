import createOrUpdateRecipe from '@/services/recipeUpdateService';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest, { params }: { params: any }) => {
  const { id } = await params;
  if (!id) {
    return new Response('Recipe ID is required', { status: 400 });
  }
  return await createOrUpdateRecipe(req, id);
};
