import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/utils/supabase/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Handles POST requests for user signup.
 *
 * Expects a JSON body with `email`, `password`, and `confirmPassword` fields.
 * Returns a JSON response with user and session data if signup is successful,
 * or an error message with the appropriate status code if signup fails.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing signup result.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { email, password, confirmPassword } = await req.json();

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Email, password, and confirm password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/confirm?type=signup`
      }
    });

    revalidatePath('/', 'layout');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      data: { user: data.user }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
