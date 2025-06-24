DROP FUNCTION IF EXISTS public.upsert_scheduled_recipes;

CREATE OR REPLACE FUNCTION public.upsert_scheduled_recipes(
    p_user_id uuid,
    p_schedules jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
    -- Delete all existing schedules for the user
    DELETE FROM public.scheduled_recipes WHERE user_id = p_user_id;

    -- Insert new schedules from the JSONB array
    INSERT INTO public.scheduled_recipes (id, recipe_id, user_id, date, repeat, repeat_end)
    SELECT
        (item->>'id')::uuid,
        (item->>'recipe_id')::uuid,
        p_user_id,
        (item->>'date')::date,
        item->>'repeat',
        (item->>'repeat_end')::date
    FROM jsonb_array_elements(p_schedules) AS arr(item);
END;
$function$;