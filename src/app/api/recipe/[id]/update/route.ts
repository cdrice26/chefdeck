import { createOrUpdateRecipe } from '@/services/recipeService';
import getRecipeUpdateData from '@/formParsers/getRecipeUpdateData';
import { NextRequest, NextResponse } from 'next/server';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

export const POST = async (req: NextRequest, { params }: { params: any }) => {
  const { id } = await params;
  if (!id) {
    return new Response('Recipe ID is required', { status: 400 });
  }
  const formData = await req.formData();
  const {
    title,
    ingredients,
    yieldValue,
    time,
    image,
    directions,
    tags,
    color
  } = getRecipeUpdateData(formData);
  try {
    const response = await createOrUpdateRecipe(
      await getAccessToken(req),
      title,
      ingredients,
      yieldValue,
      time,
      image,
      directions,
      tags,
      color,
      id
    );
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return getErrorResponse(error as PostgrestError);
  }
};
