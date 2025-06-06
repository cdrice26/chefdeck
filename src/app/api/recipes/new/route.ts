import createClient from '@/utils/supabase/supabase';
import { NextRequest } from 'next/server';

const zipArrays = (names: string[], amounts: string[], units: string[]) => {
  const maxLength = Math.max(names.length, amounts.length, units.length);
  return Array.from({ length: maxLength }, (_, index) => ({
    name: names[index],
    amount: parseInt(amounts[index]) ?? 0,
    unit: units[index],
    sequence: index + 1
  }));
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const title = formData.get('title')?.toString() || '';
  const ingredientNames = formData.getAll('ingredientNames') as string[];
  const ingredientAmounts = formData.getAll('ingredientAmounts') as string[];
  const ingredientUnits = formData.getAll('ingredientUnits') as string[];
  const yieldValue = formData.get('yield')?.toString() || '';
  const time = formData.get('time')?.toString() || '';
  const image = formData.get('image') as File | null;
  const directions = formData.getAll('directions') as string[];
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

  // Call the stored procedure
  const { error: procedureError } = await supabase.rpc('create_recipe', {
    title,
    yield_value: yieldValue,
    minutes: time,
    img_url: imagePath,
    user_id: user.id,
    ingredients: ingredients,
    directions: directions.map((direction, index) => ({
      content: direction,
      sequence: index + 1
    })),
    color
  });

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
        error: 'Recipe creation error: ' + procedureError.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ data: { message: 'Recipe created successfully.' } }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
