import getRecipe from '@/models/getRecipe';
import createClient from '@/utils/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }
  const { data, error } = await supabase.rpc('get_recipe_by_id', {
    p_id: id
  });
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  await supabase.from('recipe_usage').upsert({
    user_id: user?.id,
    recipe_id: id,
    last_viewed: new Date()
  });
  const recipe = await getRecipe(supabase)(data);
  return NextResponse.json({ data: { recipe } }, { status: 200 });
}
