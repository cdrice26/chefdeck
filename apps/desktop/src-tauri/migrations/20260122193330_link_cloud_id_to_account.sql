-- Add migration script here
CREATE TABLE IF NOT EXISTS cloud_ids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    cloud_recipe_id TEXT NOT NULL
);

ALTER TABLE recipes DROP COLUMN cloud_parent_id;
ALTER TABLE recipes ADD COLUMN cloud_parent_id INTEGER REFERENCES cloud_ids(id);
