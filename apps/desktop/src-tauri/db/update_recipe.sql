UPDATE recipes
    SET title = ?, yield = ?, minutes = ?, img_url = ?, color = ?, last_updated = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING id;
