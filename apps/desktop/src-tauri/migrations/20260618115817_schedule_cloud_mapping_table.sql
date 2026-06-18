-- Add migration script here
CREATE TABLE schedule_cloud_ids (
    id INTEGER PRIMARY KEY,
    local_id INTEGER,
    cloud_id TEXT,
    username TEXT,
    UNIQUE(local_id, cloud_id, username)
);
