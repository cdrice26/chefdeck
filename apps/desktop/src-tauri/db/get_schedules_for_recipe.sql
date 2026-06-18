SELECT id, recipe_id, date, repeat, repeat_end AS end_repeat
FROM scheduled_recipes
WHERE recipe_id = ?;
