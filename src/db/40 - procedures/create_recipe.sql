CREATE OR REPLACE FUNCTION public.create_recipe(
    p_title text, 
    p_yield_value smallint, 
    p_minutes integer, 
    p_img_url text, 
    p_current_user_id uuid, 
    p_color text, 
    p_ingredients jsonb, 
    p_directions jsonb, 
    p_tags jsonb
) 
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
    tag_name text;
    tag_id uuid;
    new_recipe_id uuid;
BEGIN
    -- Insert the new recipe
    INSERT INTO recipes (title, yield, minutes, img_url, user_id, color)
    VALUES (p_title, p_yield_value, p_minutes, p_img_url, p_current_user_id, p_color)
    RETURNING id INTO new_recipe_id;

    -- Insert ingredients
    INSERT INTO ingredients (name, amount, unit, sequence, recipe_id)
    SELECT (elem->>'name')::text, (elem->>'amount')::int, (elem->>'unit')::text, (elem->>'sequence')::int, new_recipe_id
    FROM jsonb_array_elements(p_ingredients) AS elem;

    -- Insert directions
    INSERT INTO directions (content, recipe_id, sequence)
    SELECT (elem->>'content')::text, new_recipe_id, (elem->>'sequence')::int
    FROM jsonb_array_elements(p_directions) AS elem;

    -- Insert tags
    FOR tag_name IN SELECT * FROM jsonb_array_elements_text(p_tags) LOOP
        -- Insert into user_tags if the tag does not exist for the current user
        INSERT INTO user_tags (user_id, name)
        VALUES (p_current_user_id, tag_name)
        ON CONFLICT (user_id, name) DO NOTHING;  -- Avoid inserting duplicates

        -- Get the tag_id for the current tag name
        SELECT id INTO tag_id 
        FROM user_tags ut
        WHERE ut.user_id = p_current_user_id AND ut.name = tag_name;

        -- Insert into recipe_tags
        INSERT INTO recipe_tags (recipe_id, tag_id)
        VALUES (new_recipe_id, tag_id);
    END LOOP;

    -- Update usage record
    INSERT INTO recipe_usage (user_id, recipe_id)
    VALUES (p_current_user_id, new_recipe_id)
    ON CONFLICT (user_id, recipe_id) DO UPDATE SET last_viewed = NOW();
END;
$function$;