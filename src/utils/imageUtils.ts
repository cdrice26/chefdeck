import { SupabaseClient } from '@supabase/supabase-js';

const fetchImageUrl = async (
  supabase: SupabaseClient,
  recipe: { img_url: string }
) => {
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
