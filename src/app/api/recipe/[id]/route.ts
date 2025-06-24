import { getRecipe } from '@/services/recipeService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }
  try {
    const recipe = await getRecipe(id);
    return NextResponse.json({ data: { recipe } }, { status: 200 });
  } catch (error: any) {
    if (error.code === '404') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
