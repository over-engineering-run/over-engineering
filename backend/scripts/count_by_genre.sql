CREATE OR REPLACE FUNCTION count_by_genre(year text)

    RETURNS TABLE (genre text, "count" int)
    AS
    $$

        SELECT genre, count(DISTINCT href) AS "count"
        FROM articles
        WHERE publish_at like CONCAT(year, '%')
        group by genre;

    $$
    language sql;
