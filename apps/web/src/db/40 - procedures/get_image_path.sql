DROP FUNCTION IF EXISTS public.get_image_path;

CREATE OR REPLACE FUNCTION get_image_path(p_recipe_id uuid)
  RETURNS text
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path = public
  AS $$ 
    SELECT img_url FROM recipes
      WHERE id = p_recipe_id
      LIMIT 1
  $$;