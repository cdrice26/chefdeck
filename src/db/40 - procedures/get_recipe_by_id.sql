CREATE OR REPLACE FUNCTION public.get_recipe_by_id(p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$DECLARE
    recipe_data JSONB;
BEGIN
    -- Retrieve the recipe along with its ingredients and directions
    SELECT jsonb_build_object(
        'id', r.id,
        'title', r.title,
        'yield', r.yield,
        'minutes', r.minutes,
        'img_url', r.img_url,
        'source', r.source,
        'color', r.color,
        'ingredients', COALESCE((
            SELECT jsonb_agg(i)
            FROM ingredients i
            WHERE i.recipe_id = r.id
        ), '[]'::jsonb),
        'directions', COALESCE((
            SELECT jsonb_agg(d)
            FROM directions d
            WHERE d.recipe_id = r.id
        ), '[]'::jsonb),
        'tags', COALESCE((
            SELECT jsonb_agg(ut.name) AS tag_names
            FROM recipe_tags rt
            JOIN user_tags ut ON rt.tag_id = ut.id
            WHERE rt.recipe_id = r.id
        ), '[]'::jsonb)
    ) INTO recipe_data
    FROM recipes r
    WHERE r.id = p_id;

    -- Return the recipe data
    RETURN recipe_data;
END;$function$;