import { createOrUpdateRecipe } from '@/services/recipeService';
import getRecipeUpdateData from '@/formParsers/getRecipeUpdateData';
import { NextRequest, NextResponse } from 'next/server';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { getAccessToken } from '@/utils/authUtils';

/**
 * POST /api/recipe/[id]/update
 *
 * Handles creation or update of a recipe using form data submitted in the request.
 * The route expects a recipe `id` to be present in the route parameters — if missing,
 * a 400 `Response` is returned.
 *
 * The request body must be sent as multipart/form-data and is parsed by
 * `getRecipeUpdateData` which extracts fields such as `title`, `ingredients`,
 * `yieldValue`, `time`, `image`, `directions`, `tags`, and `color`.
 *
 * Authentication:
 * - Requires an access token extracted from the incoming request using `getAccessToken`.
 *
 * On success, the handler delegates to `createOrUpdateRecipe` and returns a 201 JSON
 * response with the service response payload. Errors are forwarded to the project's
 * error utility to produce a consistent Postgrest-formatted error response.
 *
 * @param {NextRequest} req - The incoming Next.js request object containing form data.
 * @param {{ params: any }} context - Route context containing `params` with the recipe `id`.
 * @returns {Promise<NextResponse | Response>} A NextResponse with the created/updated recipe
 *   (status 201) or a plain Response when the request is invalid (e.g. missing id).
 *
 * @example
 * // POST /api/recipe/123/update
 * // form-data: { title, ingredients, ... }
 * // Response: 201 { ...createdOrUpdatedRecipe }
 */
export const POST = async (
  req: NextRequest,
  { params }: { params: any }
): Promise<NextResponse | Response> => {
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
