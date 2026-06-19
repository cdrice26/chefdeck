DROP FUNCTION IF EXISTS get_recipes_updated_after;

CREATE OR REPLACE FUNCTION get_recipes_updated_after(p_updated_after timestamptz)
RETURNS SETOF jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT get_recipe_by_id(id)
    FROM recipes r
    LEFT JOIN (
        SELECT recipe_id, MAX(last_viewed) AS last_viewed
        FROM recipe_usage
        GROUP BY recipe_id
    ) ru ON ru.recipe_id = r.id
    WHERE r.user_id = auth.uid() AND (r.last_updated >= p_updated_after
    OR (ru.last_viewed IS NOT NULL AND ru.last_viewed >= p_updated_after));
$$;
