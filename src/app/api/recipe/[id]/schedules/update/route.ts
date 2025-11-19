import { scheduleRecipe } from '@/services/recipeService';
import { Schedule } from '@/types/Schedule';
import { getAccessToken } from '@/utils/authUtils';
import { getErrorResponse } from '@/utils/errorUtils';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests for updating recipe schedules.
 *
 * Expects a JSON payload with a key `data` containing an array of objects in the format
 * [{ id: string, repeat: string, date: string, endRepeat: string }]
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a Next.js response object.
 *
 * @example
 * // POST /api/recipe/[id]/schedules/update
 * // Request body: { data: [...] }
 * // Response: { message: 'Recipe schedules updated successfully.' }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
