DROP FUNCTION IF EXISTS public.get_recipe_image;

CREATE OR REPLACE FUNCTION public.get_recipe_image(p_recipe_id uuid, p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = public
    AS $$
DECLARE
    recipe_data JSONB;
BEGIN
    -- Retrieve the recipe id and img_url for the specified recipe_id and user_id
    SELECT jsonb_build_object(
        'id', r.id,
        'img_url', r.img_url
    ) INTO recipe_data
    FROM recipes r
    WHERE r.id = p_recipe_id
      AND r.user_id = p_user_id;

    -- Return the recipe data or NULL if not found
    RETURN recipe_data;
END;
$$;