import { Recipe } from '@/types/Recipe';
import createClient from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';
import asyncMap from '@/utils/async/asyncMap';
import getRecipe from '@/models/getRecipe';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user === null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase.rpc('get_recipes', {
    in_user_id: user?.id
  });
  const recipes: Recipe[] =
    data && data?.length > 0 ? await asyncMap(data, getRecipe(supabase)) : [];
  if (error) {
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
