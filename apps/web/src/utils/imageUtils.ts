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
  recipe: { img_url: string } | null | undefined
): Promise<string | null> => {
  try {
    const path = recipe?.img_url;
    // Guard against null/undefined/empty image paths before calling storage APIs
    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      return null;
    }

    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUrl(path, 60);

    if (error) {
      return null;
    }

    return data?.signedUrl ?? null;
  } catch (err) {
    // Fail gracefully if anything unexpected happens (network/SDK issues)
    return null;
  }
};

export default fetchImageUrl;
