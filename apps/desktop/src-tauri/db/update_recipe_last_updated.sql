UPDATE recipes
    SET last_updated = ?
    WHERE id = ?
    RETURNING id;
