DROP FUNCTION IF EXISTS public.get_scheduled_recipes;

CREATE OR REPLACE FUNCTION public.get_scheduled_recipes(p_recipe_id uuid, p_user_id uuid)
RETURNS TABLE(id uuid, recipe_id uuid, user_id uuid, date date, repeat text, repeat_end date)
SET search_path = public
LANGUAGE sql
SECURITY INVOKER AS $$
    SELECT id, recipe_id, user_id, date, repeat, repeat_end
    FROM scheduled_recipes
    WHERE recipe_id = p_recipe_id AND user_id = p_user_id
$$;