CREATE OR REPLACE FUNCTION count_articles()

  RETURNS TABLE ("count" int)
  AS
  $$

    SELECT COUNT(*) AS "count"
    FROM articles;

  $$
  language sql;
