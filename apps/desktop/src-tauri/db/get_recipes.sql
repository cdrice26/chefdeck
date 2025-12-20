-- $1 = query
-- $2 = tags
-- $3 = page
-- $4 = limit

SELECT
    r.id,
    r.title,
    r.yield,
    r.minutes,
    r.img_url,
    r.source,
    r.color,
    MAX(ru.last_viewed) AS last_viewed
FROM
    recipes r
LEFT JOIN
    recipe_usage ru ON r.id = ru.recipe_id
WHERE ($1 IS NULL OR r.title LIKE '%' || $1 || '%')
    AND (
        $2 IS NULL OR
        EXISTS (
            SELECT 1 FROM recipe_tags rt
            JOIN user_tags ut ON ut.id = rt.tag_id
            WHERE rt.recipe_id = r.id AND $2 LIKE '%' || ut.name || '%'
        )
    )
GROUP BY
    r.id, r.title, r.yield, r.minutes, r.img_url, r.source, r.color
ORDER BY
    MAX(ru.last_viewed) DESC, r.title ASC
LIMIT $4 OFFSET ($3 - 1) * $4;
