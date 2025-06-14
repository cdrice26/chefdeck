import { NextResponse } from 'next/server';
import getTags from '@/models/getTags';
import createClient from '@/utils/supabase/supabase';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user === null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_tags', {
    current_user_id: user.id
  });

  console.log(data);

  if (error) {
    return NextResponse.json({ error: 'Error fetching tags' }, { status: 500 });
  }

  const tags = data && getTags(data);

  if (!tags) {
    return NextResponse.json({ error: 'No tags found' }, { status: 404 });
  }

  return NextResponse.json(tags, { status: 200 });
}
