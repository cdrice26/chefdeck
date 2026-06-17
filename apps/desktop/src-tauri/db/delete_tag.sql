DELETE FROM recipe_tags WHERE tag_id = (SELECT id FROM user_tags WHERE name = $1);
DELETE FROM tag_cloud_ids WHERE local_id = (SELECT id FROM user_tags WHERE name = $1);
DELETE FROM user_tags WHERE name = $1;
