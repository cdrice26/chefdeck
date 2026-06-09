SELECT
    r.id,
    r.title,
    r.yield,
    r.minutes,
    r.img_url,
    r.source,
    r.color,
    r.last_updated,
    c.cloud_recipe_id,
    CAST((
        SELECT MAX(strftime('%Y-%m-%d %H:%M:%S', last_viewed))
        FROM recipe_usage
        WHERE recipe_id = r.id
    ) AS TIMESTAMP) AS "last_viewed: NaiveDateTime"
FROM recipes r
LEFT JOIN (SELECT * FROM cloud_ids
                WHERE username = $1) c
    ON r.id = c.recipe_id
WHERE r.last_updated > $2;
