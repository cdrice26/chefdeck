DROP FUNCTION IF EXISTS public.get_groceries;

CREATE OR REPLACE FUNCTION public.get_groceries(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) 
RETURNS TABLE(id uuid, amount float8, unit text, name text) 
AS $$
DECLARE
    v_scheduled_recipes RECORD;
BEGIN
    FOR v_scheduled_recipes IN 
        SELECT * FROM get_scheduled_recipes(p_user_id, p_start_date, p_end_date)
    LOOP
        RETURN QUERY
        SELECT i.id as id,
               i.amount AS amount,
               i.unit AS unit,
               i.name AS name
        FROM public.ingredients i
        WHERE i.recipe_id = v_scheduled_recipes.recipe_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = 'public';
