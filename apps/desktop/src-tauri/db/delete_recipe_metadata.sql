DELETE FROM ingredients WHERE recipe_id = ?;
DELETE FROM recipe_tags WHERE recipe_id = ?;
DELETE FROM directions WHERE recipe_id = ?;
