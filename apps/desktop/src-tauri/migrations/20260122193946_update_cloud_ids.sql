-- Add migration script here
ALTER TABLE cloud_ids ADD COLUMN recipe_id INTEGER REFERENCES recipes(id);
ALTER TABLE recipes DROP COLUMN cloud_parent_id;
