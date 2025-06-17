--
-- Name: get_profile(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_profile(current_user_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$DECLARE
  username TEXT;
BEGIN
  SELECT p.username
  INTO username
  FROM profiles p
  WHERE p.user_id = current_user_id
  LIMIT 1;
  RETURN username;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;$$;


ALTER FUNCTION public.get_profile(current_user_id uuid) OWNER TO postgres;