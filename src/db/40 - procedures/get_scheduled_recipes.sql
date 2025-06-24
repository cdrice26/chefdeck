CREATE OR REPLACE FUNCTION public.get_scheduled_recipes(p_recipe_id uuid, p_user_id uuid)
RETURNS TABLE(id uuid, recipe_id uuid, user_id uuid, date date, repeat text)
SET search_path = public
SECURITY INVOKER AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM scheduled_recipes
    WHERE recipe_id = p_recipe_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;