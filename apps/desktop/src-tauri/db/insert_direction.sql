DELETE FROM directions WHERE recipe_id = ?;

INSERT INTO directions (recipe_id, content, sequence)
VALUES (?, ?, ?)
RETURNING id;
