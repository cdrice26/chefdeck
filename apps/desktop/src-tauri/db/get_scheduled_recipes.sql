SELECT s.id, r.id AS recipe_id, r.title AS recipe_name, r.color AS recipe_color, s.date, s.repeat, s.repeat_end AS end_repeat
FROM scheduled_recipes s
INNER JOIN recipes r ON s.recipe_id = r.id
WHERE (
    repeat = 'none' AND date BETWEEN ? AND ?
    OR repeat IN ('weekly', 'monthly date', 'monthly day') AND date <= ? AND COALESCE(repeat_end, ?) >= ?
);
