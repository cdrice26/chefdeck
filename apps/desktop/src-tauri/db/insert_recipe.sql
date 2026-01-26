INSERT INTO recipes (title, yield, minutes, img_url, color, last_updated, source)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    RETURNING id;
