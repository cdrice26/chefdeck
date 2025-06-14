import createClient from '@/utils/supabase/supabase';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const recipeId = req.nextUrl.searchParams.get('id');
  const supabase = await createClient();
  if (!recipeId) {
    return new Response('Recipe ID is required', { status: 400 });
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: recipe, error: recipeError } = await supabase.rpc(
    'get_recipe_image',
    {
      p_id: recipeId,
      p_user_id: user?.id
    }
  );
  if (recipeError) {
    console.error('Error fetching recipe:', recipeError);
    return new Response('Error fetching recipe', { status: 500 });
  }
  if (!recipe) {
    return new Response('Recipe not found', { status: 404 });
  }
  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUrl(recipe.img_url, 60);
  if (error) {
    console.error('Error fetching image URL:', error);
    return new Response('Error fetching image URL', { status: 500 });
  }
  if (!data?.signedUrl) {
    return new Response('Image URL not found', { status: 404 });
  }
  return new Response(data.signedUrl, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
