SELECT cloud_recipe_id, username, recipe_id FROM cloud_ids
WHERE recipe_id = $1 AND username = $2;
