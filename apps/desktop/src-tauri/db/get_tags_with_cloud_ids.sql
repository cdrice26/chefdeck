SELECT t.name, t.id FROM user_tags t
INNER JOIN tag_cloud_ids ci
    ON t.id = ci.local_id
WHERE ci.username = ?;
