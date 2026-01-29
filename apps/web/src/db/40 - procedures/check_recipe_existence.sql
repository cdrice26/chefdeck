DROP FUNCTION IF EXISTS check_recipe_existence;
DROP TYPE IF EXISTS recipe_exists;

CREATE TYPE recipe_exists AS (
	id uuid,
	is_extant boolean
);

CREATE OR REPLACE FUNCTION check_recipe_existence(p_recipe_ids text[])
RETURNS SETOF recipe_exists
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_recipe_ids uuid[] := p_recipe_ids;
    rid uuid;
BEGIN
	FOREACH rid IN ARRAY v_recipe_ids LOOP
		IF EXISTS(SELECT FROM recipes r WHERE r.id = rid) THEN
			RETURN NEXT (rid, TRUE::boolean);
		ELSE
			RETURN NEXT (rid, FALSE::boolean);
		END IF;
	END LOOP;

    RETURN;
END;
$$;
