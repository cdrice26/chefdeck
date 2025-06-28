import { scheduleRecipe } from '@/services/recipeService';
import { Schedule } from '@/types/Schedule';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    console.log(schedules);
    await scheduleRecipe(req.headers.get('Authorization'), id, schedules);
    return NextResponse.json(
      { message: 'Recipe schedules updated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    return getErrorResponse(error as PostgrestError);
  }
}
