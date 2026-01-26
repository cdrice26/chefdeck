import { createClientWithToken } from '@/utils/supabaseUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { parseRecipe, parseSchedules } from '@/models/recipeModel';
import { Schedule } from '@/types/Schedule';
import sharp from 'sharp';

/**
 * Retrieve a single recipe by ID for the authenticated user.
 *
 * @param authToken - The authentication token (may be null; a client will be created accordingly).
 * @param recipeId - The ID of the recipe to fetch.
 * @returns A Promise resolving to the parsed Recipe object.
 * @throws PostgrestError when the stored procedure fails or the recipe is not found.
 */
export const getRecipe = async (authToken: string | null, recipeId: string) => {
  const supabase = createClientWithToken(authToken ?? '');
  const { data, error } = await supabase.rpc('get_recipe_by_id', {
    p_id: recipeId
  });
  if (error)
    throw new PostgrestError({
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  if (!data)
    throw new PostgrestError({
      message: 'Recipe not found',
      code: '404',
      details: 'No recipe found with the provided ID',
      hint: 'Check if the recipe ID is correct.'
    });
  const {
    data: { user }
  } = await supabase.auth.getUser();
  await supabase.rpc('upsert_recipe_usage', {
    p_user_id: user?.id,
    p_recipe_id: recipeId,
    p_last_viewed: new Date()
  });
  const recipe = await parseRecipe(supabase)(data);
  return recipe;
};

/**
 * Obtain a signed image URL for a recipe's image.
 *
 * @param authToken - The authentication token to initialize the Supabase client.
 * @param recipeId - The ID of the recipe whose image URL should be retrieved.
 * @returns A Promise resolving to a signed image URL string (valid for a short time).
 * @throws PostgrestError when the recipe or image cannot be found or when storage access fails.
 */
export const getRecipeImageUrl = async (
  authToken: string | null,
  recipeId: string
) => {
  const supabase = createClientWithToken(authToken ?? '');
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: recipe, error: recipeError } = await supabase.rpc(
    'get_recipe_image',
    {
      p_recipe_id: recipeId,
      p_user_id: user?.id
    }
  );
  if (recipeError) {
    throw recipeError;
  }
  if (!recipe) {
    throw new PostgrestError({
      message: 'Recipe not found',
      code: '404',
      details: 'No recipe found with the provided ID',
      hint: 'Check if the recipe ID is correct and the recipe exists for the user.'
    });
  }
  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUrl(recipe.img_url, 60);

  if (error) {
    throw error;
  }
  if (!data?.signedUrl) {
    throw new PostgrestError({
      message: 'Image URL not found',
      code: '404',
      details: 'No image found with the provided recipe id',
      hint: 'Check if the recipe is correct and it exists for the user.'
    });
  }

  return data.signedUrl;
};

/**
 * Fetch schedules associated with a recipe for the authenticated user.
 *
 * @param authToken - The authentication token to initialize the Supabase client.
 * @param recipeId - The ID of the recipe whose schedules will be fetched.
 * @returns A Promise resolving to an array of Schedule objects.
 * @throws PostgrestError when the underlying RPC call fails.
 */
export const getRecipeSchedules = async (
  authToken: string | null,
  recipeId: string
) => {
  const supabase = createClientWithToken(authToken ?? '');
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.rpc('get_schedules_for_recipe', {
    p_recipe_id: recipeId,
    p_user_id: user?.id
  });
  if (error) {
    throw error;
  }
  return parseSchedules(data);
};

/**
 * Upsert (create or update) schedules for a given recipe for the authenticated user.
 *
 * @param authToken - The authentication token used to initialize the Supabase client.
 * @param recipeId - The ID of the recipe to schedule.
 * @param schedules - Array of Schedule objects to upsert for the recipe.
 * @returns A Promise that resolves when the schedules have been upserted.
 * @throws PostgrestError when the RPC call fails.
 */
export const scheduleRecipe = async (
  authToken: string | null,
  recipeId: string,
  schedules: Schedule[]
) => {
  const supabase = createClientWithToken(authToken ?? '');
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { error } = await supabase.rpc('upsert_scheduled_recipes', {
    p_user_id: user?.id,
    p_recipe_id: recipeId,
    p_schedules: schedules.map((schedule) => ({
      id: schedule.id,
      recipe_id: recipeId,
      date: schedule.date,
      repeat: schedule?.repeat,
      repeat_end: schedule?.endRepeat
    }))
  });
  if (error) throw error;
};

/**
 * Create a new recipe or update an existing one, including optional image upload and compression.
 *
 * Behavior:
 *  - Compresses/normalizes an uploaded image (if present), uploads it to storage,
 *  - Calls the appropriate stored procedure (`create_recipe` or `update_recipe`) with normalized args,
 *  - On procedure failure, attempts to remove any newly uploaded image.
 *
 * @param authToken - Authentication token to initialize Supabase client.
 * @param title - Recipe title.
 * @param ingredients - Array of ingredient objects (with name, amount, unit and sequence).
 * @param yieldValue - Number of servings/yield.
 * @param time - Preparation/cook time in minutes.
 * @param image - Optional image File to upload for the recipe.
 * @param directions - Array of direction strings for the recipe steps.
 * @param tags - Array of tag strings associated with the recipe.
 * @param color - Color identifier for UI theming.
 * @param id - Optional recipe ID; if provided the function will update that recipe, otherwise it will create a new recipe.
 * @param sourceUrl - Optional source URL for the recipe (used when creating a new recipe).
 * @returns A Promise resolving to an object containing a success message and the recipeId returned by the procedure.
 * @throws PostgrestError when authentication fails, image upload fails, or the stored procedure returns an error.
 */
export const createOrUpdateRecipe = async (
  authToken: string | null,
  title: string,
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    sequence: number;
  }[],
  yieldValue: number,
  time: number,
  image: File | null,
  directions: string[],
  tags: string[],
  color: string,
  id: string | null = null,
  sourceUrl: string | null = null
) => {
  const supabase = createClientWithToken(authToken ?? '');

  const buffer =
    image !== null && image !== undefined && image.size > 0
      ? await sharp(Buffer.from(await image.arrayBuffer()))
          .rotate()
          .resize({
            width: 1000,
            height: 1000,
            fit: sharp.fit.inside,
            withoutEnlargement: true
          })
          .toFormat('jpeg', { quality: 70 })
          .toBuffer()
      : null;

  const arrayBuffer =
    buffer !== null
      ? buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      : null;

  function ensureArrayBuffer(
    buffer: ArrayBuffer | SharedArrayBuffer
  ): ArrayBuffer {
    if (buffer instanceof ArrayBuffer) {
      return buffer;
    }
    // Convert SharedArrayBuffer to ArrayBuffer
    return new ArrayBuffer(); // creates a copy as a valid ArrayBuffer
  }

  const compressedImage =
    image && image.size > 0
      ? new File(
          [ensureArrayBuffer(arrayBuffer ?? new ArrayBuffer(0))],
          image.name.replace(/\.[^/.]+$/, '') + '.jpg',
          { type: 'image/jpeg' }
        )
      : null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new PostgrestError({
      message: 'Unauthorized',
      details: 'User is not logged in.',
      hint: 'Check that you are logged in.',
      code: '401'
    });
  }

  const imagePath =
    (compressedImage?.size ?? 0) > 0
      ? `${user.id}/${Date.now()}-${compressedImage?.name}`
      : null;
  if ((compressedImage?.size ?? 0) > 0 && !imagePath) {
    throw new PostgrestError({
      message: 'Image upload failed',
      details: 'Could not upload image',
      hint: 'Check that your image is valid.',
      code: '400'
    });
  }

  if (id && imagePath) {
    const { data: oldImagePath } = await supabase.rpc('get_image_path', {
      p_recipe_id: id
    });
    if (oldImagePath)
      await supabase.storage.from('images').remove([oldImagePath]);
  }

  const { error } = imagePath
    ? await supabase.storage
        .from('images')
        .upload(imagePath, compressedImage as Blob, {
          cacheControl: '3600',
          upsert: true
        })
    : { error: null };

  if (error) {
    throw new PostgrestError({
      message: 'Image could not be updated.',
      hint: 'Check that the image is supported.',
      code: '500',
      details: error.message
    });
  }

  const args = {
    ...{
      p_title: title,
      p_yield_value: yieldValue,
      p_minutes: time,
      p_img_url: imagePath,
      p_current_user_id: user.id,
      p_ingredients: ingredients,
      p_directions: directions.map((direction, index) => ({
        content: direction,
        sequence: index + 1
      })),
      p_tags: tags,
      p_color: color
    },
    ...(id ? { p_id: id } : {}),
    ...(id ? {} : { p_source_url: sourceUrl })
  };

  // Call the stored procedure
  const { error: procedureError, data: recipeId } = await supabase.rpc(
    id ? 'update_recipe' : 'create_recipe',
    args
  );

  if (procedureError) {
    // If the procedure fails, delete the uploaded image if it exists
    if (imagePath) {
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([imagePath]);
      if (deleteError) {
        console.error('Image deletion error:', deleteError.message);
      }
    }

    throw new PostgrestError({
      message: `Could not ${id ? 'update' : 'create'} recipe`,
      details: procedureError.message,
      hint: procedureError.hint,
      code: '500'
    });
  }

  return {
    data: {
      message: `Recipe ${id ? 'updated' : 'created'} successfully.`,
      recipeId
    }
  };
};

/**
 * Delete a recipe and its associated image (if any) for the authenticated user.
 *
 * @param authToken - Authentication token used to initialize the Supabase client.
 * @param recipeId - The ID of the recipe to delete.
 * @returns A Promise that resolves when the recipe (and its image) have been deleted.
 * @throws PostgrestError when the delete RPC fails or authentication is missing.
 */
export const deleteRecipe = async (
  authToken: string | null,
  recipeId: string
) => {
  const supabase = createClientWithToken(authToken ?? '');

  const { data: imagePath } = await supabase.rpc('get_image_path', {
    p_recipe_id: recipeId
  });

  const { error } = await supabase.rpc('delete_recipe', {
    p_recipe_id: recipeId
  });

  if (error) {
    throw new PostgrestError({
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  }

  if (imagePath) {
    await supabase.storage.from('images').remove([imagePath]);
  }
};
