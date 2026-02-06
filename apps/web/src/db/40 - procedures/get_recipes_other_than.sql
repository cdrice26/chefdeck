DROP FUNCTION IF EXISTS get_recipes_other_than;

CREATE OR REPLACE FUNCTION get_recipes_other_than(p_recipe_ids text[])
RETURNS SETOF jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT get_recipe_by_id(id) FROM recipes WHERE NOT id = ANY(p_recipe_ids::uuid[])
$$;
