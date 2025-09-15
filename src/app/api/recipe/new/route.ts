import { createOrUpdateRecipe } from '@/services/recipeService';
import getRecipeUpdateData from '@/formParsers/getRecipeUpdateData';
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const {
    title,
    ingredients,
    yieldValue,
    time,
    image,
    directions,
    tags,
    color,
    sourceUrl
  } = getRecipeUpdateData(formData);
  try {
    const updateData = await createOrUpdateRecipe(
      await getAccessToken(req),
      title,
      ingredients,
      yieldValue,
      time,
      image,
      directions,
      tags,
      color,
      sourceUrl
    );
    return NextResponse.json(updateData, { status: 200 });
  } catch (err) {
    console.log(err);
    return getErrorResponse(err as PostgrestError);
  }
};
