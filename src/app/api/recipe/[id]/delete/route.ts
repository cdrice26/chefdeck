import { deleteRecipe } from '@/services/recipeService';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }

  try {
    await deleteRecipe(id);
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }

  return NextResponse.json({
    data: { message: 'Recipe Deleted Successfully.' }
  });
}
