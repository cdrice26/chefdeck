DROP FUNCTION IF EXISTS public.update_recipe;

CREATE OR REPLACE FUNCTION public.update_recipe(
    p_id uuid, 
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
SET search_path = public, pg_catalog
SECURITY INVOKER
AS $$
DECLARE
    tag_name text;
    tag_id uuid;
BEGIN
    -- Update the recipe
    UPDATE recipes
    SET title = p_title,
        yield = p_yield_value,
        minutes = p_minutes,
        img_url = CASE
            WHEN p_img_url IS NOT NULL THEN p_img_url
            ELSE img_url
        END,
        color = p_color
    WHERE id = p_id AND user_id = p_current_user_id;

    -- Update ingredients
    DELETE FROM ingredients WHERE recipe_id = p_id;
    INSERT INTO ingredients (name, amount, unit, sequence, recipe_id)
    SELECT (elem->>'name')::text, (elem->>'amount')::int, (elem->>'unit')::text, (elem->>'sequence')::int, p_id
    FROM jsonb_array_elements(p_ingredients) AS elem;

    -- Update directions
    DELETE FROM directions WHERE recipe_id = p_id;
    INSERT INTO directions (content, recipe_id, sequence)
    SELECT (elem->>'content')::text, p_id, (elem->>'sequence')::int
    FROM jsonb_array_elements(p_directions) AS elem;

    -- Update tags
    DELETE FROM recipe_tags WHERE recipe_id = p_id;
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
        VALUES (p_id, tag_id);
    END LOOP;

    -- Update usage record
    INSERT INTO recipe_usage (user_id, recipe_id)
    VALUES (p_current_user_id, p_id)
    ON CONFLICT (user_id, recipe_id) DO UPDATE SET last_viewed = NOW();
END;
$$ LANGUAGE plpgsql;