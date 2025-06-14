import createClient from '@/utils/supabase/supabase';
import { NextRequest } from 'next/server';
import { zipArrays } from '@/utils/arrayUtils';

const createOrUpdateRecipe = async (
  req: NextRequest,
  id: string | null = null
) => {
  const formData = await req.formData();
  const title = formData.get('title')?.toString() || '';
  const ingredientNames = formData.getAll('ingredientNames') as string[];
  const ingredientAmounts = formData.getAll('ingredientAmounts') as string[];
  const ingredientUnits = formData.getAll('ingredientUnits') as string[];
  const yieldValue = formData.get('yield')?.toString() || '';
  const time = formData.get('time')?.toString() || '';
  const image = formData.get('image') as File | null;
  const directions = formData.getAll('directions') as string[];
  const tags = formData.getAll('tags[]') as string[];
  const ingredients = zipArrays(
    ingredientNames,
    ingredientAmounts,
    ingredientUnits
  );
  const color = formData.get('color')?.toString() || 'white';

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

    console.log('Procedure error:', procedureError.message);

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

export default createOrUpdateRecipe;
