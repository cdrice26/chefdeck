import fetchImageUrl from '@/utils/supabase/fetchImageUrl';
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
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `id, title, yield, minutes, img_url, source, color, 
      ingredients (id, name, amount, unit, sequence),
      directions (id, content, sequence)`
    )
    .eq('id', id)
    .single();
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
  const recipe = {
    id: data?.id,
    title: data?.title,
    servings: data?.yield,
    minutes: data?.minutes,
    imgUrl: await fetchImageUrl(supabase, data),
    sourceUrl: data?.source,
    color: data?.color,
    ingredients: data?.ingredients
      ?.sort((a, b) => a.sequence - b.sequence)
      ?.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit
      })),
    directions: data?.directions
      ?.sort((a, b) => a.sequence - b.sequence)
      ?.map((direction: any) => ({
        id: direction.id,
        content: direction.content
      }))
  };
  return NextResponse.json({ data: { recipe } }, { status: 200 });
}
