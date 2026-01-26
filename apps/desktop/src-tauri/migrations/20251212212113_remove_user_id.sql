-- Add migration script here
DROP TABLE IF EXISTS user_tags;
CREATE TABLE user_tags (
    id INTEGER PRIMARY KEY,
    name TEXT,
    UNIQUE (name)
);
DROP TABLE IF EXISTS shared_recipes;
DROP TABLE IF EXISTS profiles;
ALTER TABLE scheduled_recipes DROP COLUMN user_id;
DROP TABLE IF EXISTS recipe_usage;
CREATE TABLE recipe_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_viewed DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recipe_id INTEGER NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
