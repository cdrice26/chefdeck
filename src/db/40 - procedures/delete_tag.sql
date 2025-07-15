DROP FUNCTION IF EXISTS public.delete_tag;

CREATE OR REPLACE FUNCTION public.delete_tag(current_user_id uuid, tag_value text) RETURNS void
    LANGUAGE plpgsql
    SET search_path = public
    SECURITY INVOKER
    AS $$
BEGIN
    DELETE FROM user_tags
    WHERE user_id = current_user_id AND name = tag_value;
END;
$$;