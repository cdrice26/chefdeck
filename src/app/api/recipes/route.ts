import { Recipe } from '@/types/Recipe';
import createClient from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';
import asyncMap from '@/utils/async/asyncMap';
import getRecipe from '@/utils/objectCreators/getRecipe';

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
    data && data?.length > 0 ? await asyncMap(data, getRecipe(supabase)) : [];
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
