-- Add migration script here
CREATE TABLE tag_cloud_ids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    cloud_id TEXT,
    local_id INTEGER,
    UNIQUE(username, cloud_id)
);
