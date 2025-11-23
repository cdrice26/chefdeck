DROP FUNCTION IF EXISTS public.get_dates_by_dow_and_wom;

CREATE OR REPLACE FUNCTION public.get_dates_by_dow_and_wom(start_date date, end_date date)
RETURNS TABLE(matching_date date) AS $$
BEGIN
    RETURN QUERY
    SELECT d::date
    FROM generate_series(start_date, end_date, INTERVAL '1 day') AS d
    WHERE EXTRACT(DOW FROM d) = EXTRACT(DOW FROM start_date)
      AND ((EXTRACT(DAY FROM d)::int - 1) / 7 + 1) = ((EXTRACT(DAY FROM start_date)::int - 1) / 7 + 1);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;
