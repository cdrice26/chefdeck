import { createOrUpdateRecipe } from '@/services/recipeService';
import { Ingredient } from '@/types/Recipe';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  const formData = await req.json();
  const url = formData?.url as string | null;
  if (url === null) {
    return NextResponse.json(
      { error: { message: 'URL is required.' } },
      { status: 400 }
    );
  }
  try {
    const resp = await fetch(
      `${process.env.PYTHON_API_URL}/scrape-recipe?url=${encodeURIComponent(
        url
      )}`,
      {
        headers: {
          'X-API-Key': process.env.PYTHON_API_KEY ?? ''
        }
      }
    );
    if (!resp.ok) {
      if (resp.status === 429) {
        return NextResponse.json(
          {
            error: { message: 'Too many requests. Try again in a minute.' }
          },
          { status: 429 }
        );
      }
      if (resp.status === 403) {
        return NextResponse.json({
          error: {
            message: "That website doesn't permit Cooky to access its recipes."
          }
        });
      }
      return NextResponse.json({
        error: { message: 'Error fetching recipe from website, check the URL.' }
      });
    }
    const recipe = await resp.json();
    const title = recipe.title;
    const ingredients = recipe.ingredients.map(
      (ing: Ingredient, idx: number) => ({
        ...ing,
        sequence: idx + 1
      })
    );
    const yieldValue = recipe.servings;
    const time = recipe.minutes;
    const directions = recipe.directions;
    const sourceUrl = recipe.source_url;

    try {
      const updateData = await createOrUpdateRecipe(
        await getAccessToken(req),
        title,
        ingredients,
        yieldValue,
        time,
        null,
        directions,
        [],
        'white',
        null,
        sourceUrl
      );
      return NextResponse.json(updateData, { status: 200 });
    } catch (err) {
      console.log(err);
      return getErrorResponse(err as PostgrestError);
    }
  } catch (err) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch recipe' } },
      { status: 500 }
    );
  }
};
