import { getRecipe } from '@/services/recipeService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }
  try {
    const recipe = await getRecipe(req.headers.get('Authorization'), id);
    return NextResponse.json({ data: { recipe } }, { status: 200 });
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }
}
