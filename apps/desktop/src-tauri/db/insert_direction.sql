INSERT INTO directions (recipe_id, content, sequence)
VALUES ($1, $2, $3)
RETURNING id;
