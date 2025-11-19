import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Retrieve a short-lived signed URL for a recipe image stored in Supabase Storage.
 *
 * @param supabase - Supabase client instance used to access the storage API.
 * @param recipe - Object containing the `img_url` path for the recipe image in storage.
 * @returns A Promise that resolves to a signed URL string valid for a short time, or `null` if the image or URL could not be retrieved.
 */
const fetchImageUrl = async (
  supabase: SupabaseClient,
  recipe: { img_url: string }
): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUrl(recipe.img_url, 60);
  if (error) {
    return null;
  } else {
    return data?.signedUrl || null;
  }
};

export default fetchImageUrl;
