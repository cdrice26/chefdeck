SELECT
    id,
    title,
    yield,
    minutes,
    img_url,
    source,
    color
FROM recipes WHERE id = ?;
