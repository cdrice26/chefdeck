DELETE FROM recipe_tags WHERE recipe_id = ?;

INSERT INTO recipe_tags (recipe_id, tag_id)
VALUES (?, ?);
