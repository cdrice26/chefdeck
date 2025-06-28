import { createOrUpdateRecipe } from '@/services/recipeService';
import getRecipeUpdateData from '@/formParsers/getRecipeUpdateData';
import { NextRequest } from 'next/server';
import { getAccessToken } from '@/utils/authUtils';

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
    color
  } = getRecipeUpdateData(formData);
  return await createOrUpdateRecipe(
    await getAccessToken(req),
    title,
    ingredients,
    yieldValue,
    time,
    image,
    directions,
    tags,
    color
  );
};
