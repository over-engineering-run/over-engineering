CREATE OR REPLACE FUNCTION prog_lang_count(top_n int)

    RETURNS TABLE (prog_lang text, "count" int)
    AS
    $$

        WITH prog_lang_flat AS (SELECT UNNEST(programming_languages) AS prog_lang FROM articles)

        SELECT prog_lang, COUNT(*) AS "count"
        FROM prog_lang_flat
        GROUP BY prog_lang
        ORDER BY COUNT(*) DESC, prog_lang
        LIMIT top_n;

    $$
    language sql;
