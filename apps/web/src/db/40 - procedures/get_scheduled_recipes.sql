DROP FUNCTION IF EXISTS public.get_scheduled_recipes;

CREATE OR REPLACE FUNCTION public.get_scheduled_recipes(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) 
RETURNS TABLE(schedule_id uuid, recipe_id uuid, recipe_title text, recipe_color text, scheduled_date timestamptz) 
AS $$
BEGIN
    RETURN QUERY
    SELECT sr.id AS schedule_id, 
           sr.recipe_id, 
           r.title AS recipe_title, 
           r.color AS recipe_color,
           gs.scheduled_date
    FROM public.scheduled_recipes sr
    INNER JOIN public.recipes r ON sr.recipe_id = r.id
    LEFT JOIN LATERAL (
        SELECT 
            sr.date AS scheduled_date
        WHERE sr.repeat = 'none'
        UNION ALL
        SELECT generate_series(sr.date, sr.repeat_end, '7 days'::interval) 
        WHERE sr.repeat = 'weekly'
        UNION ALL
        SELECT generate_series(sr.date, sr.repeat_end, '1 month'::interval) 
        WHERE sr.repeat = 'monthly date'
        UNION ALL
        SELECT get_dates_by_dow_and_wom(sr.date::date, sr.repeat_end::date)
        WHERE sr.repeat = 'monthly day'
    ) gs ON true
    WHERE sr.user_id = p_user_id
      AND gs.scheduled_date IS NOT NULL
      AND gs.scheduled_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = 'public';