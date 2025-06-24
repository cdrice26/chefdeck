import { createOrUpdateRecipe } from '@/services/recipeService';
import getRecipeUpdateData from '@/formParsers/getRecipeUpdateData';
import { NextRequest } from 'next/server';

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
