INSERT INTO recipe_usage (recipe_id, last_viewed)
    VALUES (?, CURRENT_TIMESTAMP) RETURNING id;;
