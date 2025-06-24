CREATE OR REPLACE FUNCTION public.get_profile(current_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
  RETURN (
    SELECT p.username
    FROM profiles p
    WHERE p.user_id = current_user_id
    LIMIT 1
  );
END;
$function$;