WITH RECURSIVE

monthly_day_months(sr_id, month_start, repeat_end, target_dow, target_wom) AS (
    SELECT
        sr.id,
        date(sr.date, 'start of month'),
        sr.repeat_end,
        CAST(strftime('%w', sr.date) AS INTEGER),
        CAST((strftime('%d', sr.date) - 1) / 7 + 1 AS INTEGER)
    FROM scheduled_recipes sr
    WHERE sr.repeat = 'monthly day'

    UNION ALL

    SELECT
        m.sr_id,
        date(m.month_start, '+1 month'),
        m.repeat_end,
        m.target_dow,
        m.target_wom
    FROM monthly_day_months m
    WHERE date(m.month_start, '+1 month') <= m.repeat_end
),

monthly_day_dates AS (
    SELECT
        m.sr_id,
        m.month_start,
        date(
            m.month_start,
            '+' || (
                (m.target_wom - 1) * 7
                + (m.target_dow - CAST(strftime('%w', m.month_start) AS INTEGER) + 7) % 7
            ) || ' days'
        ) AS scheduled_date
    FROM monthly_day_months m
),

repeat_dates(sr_id, scheduled_date, repeat_end, repeat, step) AS (
    SELECT
        sr.id,
        sr.date,
        sr.repeat_end,
        sr.repeat,
        CASE sr.repeat
            WHEN 'weekly'       THEN '+7 days'
            WHEN 'monthly date' THEN '+1 month'
        END AS step
    FROM scheduled_recipes sr
    WHERE sr.repeat IN ('weekly', 'monthly date')

    UNION ALL

    SELECT
        rd.sr_id,
        date(rd.scheduled_date, rd.step),
        rd.repeat_end,
        rd.repeat,
        rd.step
    FROM repeat_dates rd
    WHERE date(rd.scheduled_date, rd.step) <= rd.repeat_end
),

all_scheduled_dates AS (
    SELECT sr.id AS sr_id, sr.recipe_id, sr.date AS scheduled_date
    FROM scheduled_recipes sr
    WHERE sr.repeat = 'none'

    UNION ALL

    SELECT sr.id AS sr_id, sr.recipe_id, rd.scheduled_date AS scheduled_date
    FROM repeat_dates rd
    JOIN scheduled_recipes sr ON sr.id = rd.sr_id

    UNION ALL

    SELECT sr.id AS sr_id, sr.recipe_id, mdd.scheduled_date
    FROM monthly_day_dates mdd
    JOIN scheduled_recipes sr ON sr.id = mdd.sr_id
    WHERE strftime('%Y-%m', mdd.scheduled_date) = strftime('%Y-%m', mdd.month_start)
)

SELECT
    i.id,
    i.amount,
    i.unit,
    i.name
FROM ingredients i
JOIN all_scheduled_dates asd ON i.recipe_id = asd.recipe_id
WHERE asd.scheduled_date BETWEEN date(?) AND date(?);
