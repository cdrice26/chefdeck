DROP FUNCTION IF EXISTS public.get_all_schedules;

CREATE OR REPLACE FUNCTION public.get_all_schedules()
RETURNS TABLE(id uuid, recipe_id uuid, user_id uuid, date date, repeat text, repeat_end date)
SET search_path = public
LANGUAGE sql
SECURITY INVOKER AS $$
    SELECT id, recipe_id, user_id, date, repeat, repeat_end
    FROM scheduled_recipes
    WHERE user_id = auth.uid()
$$;
