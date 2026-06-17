INSERT INTO tag_cloud_ids (local_id, username) VALUES ($1, $2) ON CONFLICT DO NOTHING;
