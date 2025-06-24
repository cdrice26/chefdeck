DROP FUNCTION IF EXISTS public.upsert_scheduled_recipe;

CREATE OR REPLACE FUNCTION public.upsert_scheduled_recipe(p_id uuid, p_recipe_id uuid, p_user_id uuid, p_date date, p_repeat text, p_repeat_end date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.scheduled_recipes (id, recipe_id, user_id, date, repeat, repeat_end)
    VALUES (p_id, p_recipe_id, p_user_id, p_date, p_repeat, p_repeat_end)
    ON CONFLICT (id) DO UPDATE
    SET recipe_id = EXCLUDED.recipe_id,
        user_id = EXCLUDED.user_id,
        date = EXCLUDED.date,
        repeat = EXCLUDED.repeat,
        repeat_end = EXCLUDED.repeat_end;
END;
$function$;