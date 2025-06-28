import parseTags from '@/models/tagsModel';
import { PostgrestError } from '@supabase/supabase-js';
import { createClientWithToken } from '@/utils/supabaseUtils';

export const getTags = async (authToken: string | null): Promise<string[]> => {
  const supabase = createClientWithToken(authToken ?? '');

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user === null) {
    throw new PostgrestError({
      message: 'Unauthorized',
      code: '401',
      details: 'User is not authenticated',
      hint: 'Please log in to access your tags'
    });
  }

  const { data, error } = await supabase.rpc('get_tags', {
    current_user_id: user.id
  });
  if (error) {
    throw new PostgrestError({
      message: 'Error fetching tags',
      code: error.code || '500',
      details: error.message,
      hint: 'Check your database connection or the get_tags function'
    });
  }

  const tags = data && parseTags(data);

  if (!tags) {
    throw new PostgrestError({
      message: 'No tags found',
      code: '404',
      details: 'The user has no tags associated',
      hint: 'Ensure that the user has created tags'
    });
  }

  return tags;
};
