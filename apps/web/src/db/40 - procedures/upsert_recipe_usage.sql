DROP FUNCTION IF EXISTS public.upsert_recipe_usage;

CREATE OR REPLACE FUNCTION public.upsert_recipe_usage(p_user_id uuid, p_recipe_id uuid, p_last_viewed timestamptz)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.recipe_usage (user_id, recipe_id, last_viewed)
    VALUES (p_user_id, p_recipe_id, p_last_viewed)
    ON CONFLICT (user_id, recipe_id) DO UPDATE
    SET last_viewed = p_last_viewed;
END;
$function$;