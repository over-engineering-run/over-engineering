CREATE OR REPLACE FUNCTION count_by_genre(year text, top_n int default null)

    RETURNS TABLE (genre text, "count" int)
    AS
    $$

        SELECT genre, count(DISTINCT href) AS "count"
        FROM articles
        WHERE publish_at like CONCAT(year, '%')
        GROUP BY genre
        ORDER BY "count" DESC
        LIMIT top_n;

    $$
    language sql;
