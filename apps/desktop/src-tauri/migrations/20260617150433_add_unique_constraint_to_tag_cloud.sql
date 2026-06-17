-- Add migration script here
-- 1. Create replacement table
CREATE TABLE tag_cloud_ids_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    local_id INTEGER,
    UNIQUE(username, local_id)
);

-- 2. Copy data across
INSERT INTO tag_cloud_ids_new (id, username, local_id)
SELECT id, username, local_id FROM tag_cloud_ids;

-- 3. Swap
DROP TABLE tag_cloud_ids;
ALTER TABLE tag_cloud_ids_new RENAME TO tag_cloud_ids;
