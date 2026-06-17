-- 1. Create replacement table without cloud_id
CREATE TABLE tag_cloud_ids_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    local_id INTEGER
);

-- 2. Copy data across
INSERT INTO tag_cloud_ids_new (id, username, local_id)
SELECT id, username, local_id FROM tag_cloud_ids;

-- 3. Swap
DROP TABLE tag_cloud_ids;
ALTER TABLE tag_cloud_ids_new RENAME TO tag_cloud_ids;
