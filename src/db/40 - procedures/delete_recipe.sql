CREATE OR REPLACE FUNCTION public.delete_recipe(p_recipe_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO public
 SECURITY INVOKER
AS $function$
BEGIN
    DELETE FROM recipes
    WHERE id = p_recipe_id
      AND user_id = (SELECT auth.uid());  -- Ensure the user can only delete their own recipes
END;
$function$;