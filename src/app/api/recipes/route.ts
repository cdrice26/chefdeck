import { Recipe } from '@/types/Recipe';
import createClient from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';
import asyncMap from '@/utils/async/asyncMap';
import { SupabaseClient } from '@supabase/supabase-js';

const fetchImageUrl = async (
  supabase: SupabaseClient,
  recipe: { [key: string]: string }
) => {
  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUrl(recipe.img_url, 60);
  if (error) {
    return null;
  } else {
    return data?.signedUrl || null;
  }
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `id, title, yield, minutes, img_url, source, color, 
      ingredients (id, name, amount, unit),
      directions (id, content)`
    )
    .eq('user_id', user?.id);
  const recipes: Recipe[] =
    data && data?.length > 0
      ? await asyncMap(data, async (recipe) => ({
          id: recipe.id,
          title: recipe.title,
          servings: recipe.yield,
          minutes: recipe.minutes,
          imgUrl: await fetchImageUrl(supabase, recipe),
          sourceUrl: recipe.source,
          color: recipe.color,
          ingredients: recipe.ingredients.map((ingredient: any) => ({
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit
          })),
          directions: recipe.directions.map((direction: any) => ({
            id: direction.id,
            content: direction.content
          }))
        }))
      : [];
  if (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Error fetching recipes' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.json(
    { data: recipes },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
