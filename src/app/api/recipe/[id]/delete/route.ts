import { deleteRecipe } from '@/services/recipeService';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }

  try {
    await deleteRecipe(await getAccessToken(req), id);
  } catch (error: any) {
    return getErrorResponse(error as PostgrestError);
  }

  return NextResponse.json({
    data: { message: 'Recipe Deleted Successfully.' }
  });
}
