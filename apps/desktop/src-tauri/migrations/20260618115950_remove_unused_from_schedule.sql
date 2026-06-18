-- Add migration script here
ALTER TABLE scheduled_recipes DROP COLUMN last_updated;
ALTER TABLE scheduled_recipes DROP COLUMN cloud_parent_id;
