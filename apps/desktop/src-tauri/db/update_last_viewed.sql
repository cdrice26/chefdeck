INSERT INTO recipe_usage (recipe_id, last_viewed)
    VALUES (?, ?) RETURNING id;
