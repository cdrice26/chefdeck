SELECT
    ut.id,
    ut.name
FROM recipe_tags rt
INNER JOIN user_tags ut ON ut.id = rt.tag_id
WHERE rt.recipe_id = ?;
