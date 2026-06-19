DELETE FROM schedule_cloud_ids WHERE local_id IN (SELECT id FROM scheduled_recipes WHERE recipe_id = ?);
DELETE FROM scheduled_recipes WHERE recipe_id = ?;
