import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClientWithToken } from '@/utils/supabaseUtils';
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/utils/authUtils';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const clientSupabase = createClientWithToken(await getAccessToken(req));

    const adminSupabase = createAdminClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!adminSupabase || !clientSupabase) {
      return NextResponse.json(
        { error: 'Failed to create Supabase client' },
        { status: 500 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: userError
    } = await clientSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Re-authenticate user by signing in with email and password
    const { error: signInError } = await clientSupabase.auth.signInWithPassword(
      {
        email: user.email!,
        password
      }
    );

    if (signInError) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 403 }
      );
    }

    const userId = user.id;

    // Delete user
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      user?.id
    );

    if (deleteError) {
      console.log(deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Delete user's images from storage
    const { data: images, error: imagesError } = await adminSupabase.storage
      .from('images')
      .list(userId, { limit: 1000 });

    if (imagesError) {
      console.log(imagesError);
    } else {
      const { error: deleteImagesError } = await adminSupabase.storage
        .from('images')
        .remove(images.map((image) => `${userId}/${image?.name ?? ''}`));

      if (deleteImagesError) {
        console.log(deleteImagesError);
      }
    }

    // Sign out the user (invalidate session)
    await clientSupabase.auth.signOut();

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
