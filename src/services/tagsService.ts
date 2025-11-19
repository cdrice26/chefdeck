import parseTags from '@/models/tagsModel';
import { PostgrestError } from '@supabase/supabase-js';
import { createClientWithToken } from '@/utils/supabaseUtils';

/**
 * Fetch available tags for the authenticated user.
 *
 * @param authToken - Auth token used to initialize the Supabase client (may be null).
 * @returns Promise resolving to an array of tag strings.
 * @throws PostgrestError when authentication fails or the RPC returns an error.
 */
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

/**
 * Delete a tag for the authenticated user.
 *
 * @param authToken - Auth token used to initialize the Supabase client (may be null).
 * @param tagValue - The tag value to delete.
 * @returns Promise that resolves when the deletion completes.
 * @throws PostgrestError when authentication fails or the RPC returns an error.
 */
export const deleteTag = async (
  authToken: string | null,
  tagValue: string
): Promise<void> => {
  const supabase = createClientWithToken(authToken ?? '');

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user === null) {
    throw new PostgrestError({
      message: 'Unauthorized',
      code: '401',
      details: 'User is not authenticated',
      hint: 'Please log in to delete a tag'
    });
  }

  const { error } = await supabase.rpc('delete_tag', {
    current_user_id: user.id,
    tag_value: tagValue
  });

  if (error) {
    throw new PostgrestError({
      message: 'Error deleting tag',
      code: error.code || '500',
      details: error.message,
      hint: 'Check your database connection or the delete_tag function'
    });
  }
};
