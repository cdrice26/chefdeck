import createClient from '@/utils/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!id) {
    return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
  }
  const { error } = await supabase.rpc('delete_recipe', {
    p_recipe_id: id
  });
  if (error) {
    return NextResponse.json(
      { error: error?.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
  return NextResponse.json({
    data: { message: 'Recipe Deleted Successfully.' }
  });
}
