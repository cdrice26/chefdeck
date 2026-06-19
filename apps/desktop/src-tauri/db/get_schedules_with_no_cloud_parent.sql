SELECT s.id, s.recipe_id, s.date, s.repeat, s.repeat_end AS end_repeat
FROM scheduled_recipes s
LEFT JOIN schedule_cloud_ids cid ON cid.local_id = s.id
WHERE cid.local_id IS NULL
