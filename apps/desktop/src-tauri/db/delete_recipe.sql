DELETE FROM recipe_usage WHERE recipe_id = $1;
DELETE FROM ingredients WHERE recipe_id = $1;
DELETE FROM directions WHERE recipe_id = $1;
DELETE FROM recipe_tags WHERE recipe_id = $1;
DELETE FROM cloud_ids WHERE recipe_id = $1;
DELETE FROM scheduled_recipes WHERE recipe_id = $1;
DELETE FROM recipes WHERE id = $1;
