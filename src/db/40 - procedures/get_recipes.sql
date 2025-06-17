--
-- Name: get_recipes(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_recipes(in_user_id uuid) RETURNS TABLE(id uuid, title text, yield smallint, minutes integer, img_url text, source text, color text, ingredients jsonb, directions jsonb, last_viewed timestamp with time zone, tags jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.yield,
        r.minutes,
        r.img_url,
        r.source,
        r.color,
        (SELECT jsonb_agg(jsonb_build_object('id', i.id, 'name', i.name, 'amount', i.amount, 'unit', i.unit))
         FROM ingredients i 
         WHERE i.recipe_id = r.id) AS ingredients,
        (SELECT jsonb_agg(jsonb_build_object('id', d.id, 'content', d.content))
         FROM directions d 
         WHERE d.recipe_id = r.id) AS directions,
        MAX(ru.last_viewed) AS last_viewed,
        (SELECT COALESCE(jsonb_agg(ut.name), '[]'::jsonb)
         FROM recipe_tags rt 
         JOIN user_tags ut ON ut.id = rt.tag_id 
         WHERE rt.recipe_id = r.id AND ut.user_id = in_user_id) AS tags
    FROM 
        recipes r
    LEFT JOIN 
        recipe_usage ru ON r.id = ru.recipe_id AND ru.user_id = in_user_id
    WHERE 
        r.user_id = in_user_id
    GROUP BY 
        r.id, r.title, r.yield, r.minutes, r.img_url, r.source, r.color;  -- Include all non-aggregated columns
END;
$$;


ALTER FUNCTION public.get_recipes(in_user_id uuid) OWNER TO postgres;