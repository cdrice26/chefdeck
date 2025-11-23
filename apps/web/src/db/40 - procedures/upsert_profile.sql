DROP FUNCTION IF EXISTS public.upsert_profile;

CREATE OR REPLACE FUNCTION public.upsert_profile(p_user_id uuid, p_username text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (p_user_id, p_username)
    ON CONFLICT (user_id) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        username = EXCLUDED.username;
END;
$function$;