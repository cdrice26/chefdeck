CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  yield INTEGER NOT NULL,
  minutes INTEGER NOT NULL,
  color TEXT NOT NULL,
  img_url TEXT,
  source TEXT,
  last_updated DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE user_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  user_id INTEGER
);

CREATE TABLE directions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  name TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK (sequence > 0),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE recipe_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (tag_id) REFERENCES user_tags(id)
);

CREATE TABLE recipe_usage (
  last_viewed DATETIME NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE scheduled_recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  repeat TEXT,
  repeat_end DATE,
  last_updated DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE shared_recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner INTEGER NOT NULL,
  recipient INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE profiles (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT (datetime('now'))
);
