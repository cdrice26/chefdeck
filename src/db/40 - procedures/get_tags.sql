--
-- Name: get_tags(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_tags(current_user_id uuid) RETURNS TABLE(tag_id uuid, tag_name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT ut.id, ut.name
    FROM user_tags ut
    WHERE ut.user_id = current_user_id;
END;
$$;


ALTER FUNCTION public.get_tags(current_user_id uuid) OWNER TO postgres;
