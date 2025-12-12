DELETE FROM ingredients WHERE recipe_id = ?;

INSERT INTO ingredients (recipe_id, name, amount, unit, sequence) VALUES (?, ?, ?, ?, ?) RETURNING id;;
