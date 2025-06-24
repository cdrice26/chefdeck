import createClient from '@/utils/supabase/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import getRecipeFromDBResult from '@/models/recipeModel';

export const getRecipe = async (recipeId: string) => {
  const supabase = await createClient();
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
  const recipe = await getRecipeFromDBResult(supabase)(data);
  return recipe;
};

export const getRecipeImageUrl = async (recipeId: string) => {
  const supabase = await createClient();
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
      details: 'No image found with the provided URL',
      hint: 'Check if the URL is correct and it exists for the user.'
    });
  }

  return data.signedUrl;
};

export const createOrUpdateRecipe = async (
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
  const supabase = await createClient();

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
    console.log('Image error');
    return new Response(JSON.stringify({ error: 'Image upload failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { error } = imagePath
    ? await supabase.storage.from('images').upload(imagePath, image as Blob, {
        cacheControl: '3600',
        upsert: true
      })
    : { error: null };

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Image error: ' + error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
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

    return new Response(
      JSON.stringify({
        error:
          `Recipe ${id ? 'update' : 'creation'} error: ` +
          procedureError.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({
      data: { message: `Recipe ${id ? 'updated' : 'created'} successfully.` }
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export const deleteRecipe = async (recipeId: string) => {
  const supabase = await createClient();

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
};
