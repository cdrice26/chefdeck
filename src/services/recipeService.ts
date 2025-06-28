import { createClientWithToken } from '@/utils/supabaseUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { parseRecipe, parseSchedules } from '@/models/recipeModel';
import { Schedule } from '@/types/Schedule';

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

export const getRecipeSchedules = async (
  authToken: string | null,
  recipeId: string
) => {
  const supabase = createClientWithToken(authToken ?? '');
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.rpc('get_scheduled_recipes', {
    p_recipe_id: recipeId,
    p_user_id: user?.id
  });
  if (error) {
    throw error;
  }
  return parseSchedules(data);
};

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
  id: string | null = null
) => {
  const supabase = createClientWithToken(authToken ?? '');

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const imagePath =
    (image?.size ?? 0) > 0 ? `${user.id}/${Date.now()}-${image?.name}` : null;
  if ((image?.size ?? 0) > 0 && !imagePath) {
    return new Response(JSON.stringify({ error: 'Image upload failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
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
    ? await supabase.storage.from('images').upload(imagePath, image as Blob, {
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
    ...(id ? { p_id: id } : {})
  };

  // Call the stored procedure
  const { error: procedureError } = await supabase.rpc(
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
    data: { message: `Recipe ${id ? 'updated' : 'created'} successfully.` }
  };
};

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
