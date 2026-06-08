INSERT INTO directions (recipe_id, content, sequence)
VALUES (?, ?, ?)
RETURNING id;
