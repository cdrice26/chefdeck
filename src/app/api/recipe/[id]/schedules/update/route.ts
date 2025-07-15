import { scheduleRecipe } from '@/services/recipeService';
import { Schedule } from '@/types/Schedule';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data } = await req.json();
  try {
    const schedules: Schedule[] = data.map((schedule: any) => ({
      id: schedule.id,
      recipeId: id,
      repeat: schedule.repeat,
      date: new Date(schedule?.date),
      endRepeat: new Date(schedule?.endRepeat)
    }));
    await scheduleRecipe(await getAccessToken(req), id, schedules);
    return NextResponse.json(
      { message: 'Recipe schedules updated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return getErrorResponse(error as PostgrestError);
  }
}
