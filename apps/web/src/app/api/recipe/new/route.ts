import { createOrUpdateRecipe } from '@/services/recipeService';
import getRecipeUpdateData from '@/formParsers/getRecipeUpdateData';
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';

const MAX_BODY_SIZE = 1024 * 1024 * 10;

/**
 * Handles POST requests to create or update a recipe. If an error occurs, it returns an error response.
 *
 * @param {NextRequest} req - The incoming request object containing form data.
 * @returns {Promise<NextResponse>} A response containing the updated recipe data or an error response.
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const contentLength = req.headers.get('content-length');

  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json(
      {
        message:
          'Recipe size too large. Maximum size is 10MB. Try a smaller image.'
      },
      { status: 413 }
    );
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
    color,
    sourceUrl,
    lastViewed,
    lastUpdated
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
      null,
      sourceUrl,
      lastViewed,
      lastUpdated
    );
    return NextResponse.json(updateData, { status: 200 });
  } catch (err) {
    console.log(err);
    return getErrorResponse(err as PostgrestError);
  }
};
