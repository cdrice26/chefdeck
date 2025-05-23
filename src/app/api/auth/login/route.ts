import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/lib/supabase/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Handles POST requests for user login.
 *
 * Expects a JSON body with `email` and `password` fields.
 * Returns a JSON response with user and session data if authentication is successful,
 * or an error message with the appropriate status code if authentication fails.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing authentication result.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    revalidatePath('/', 'layout');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      data: { user: data.user, session: data.session }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
