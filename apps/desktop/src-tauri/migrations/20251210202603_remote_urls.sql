-- Add migration script here
ALTER TABLE recipes ADD COLUMN cloud_parent_id TEXT;
ALTER TABLE scheduled_recipes ADD COLUMN cloud_parent_id TEXT;
