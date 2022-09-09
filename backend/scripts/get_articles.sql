CREATE OR REPLACE FUNCTION get_articles("offset" int, "limit" int)

  RETURNS TABLE (
    href text,
    title text,
    content_html text,
    raw_tags_string text,
    genre text,
    published_at text,
    author_href text,
    author_name text,
    series_href text,
    series_name text,
    series_num text,
    keywords_unigram text[],
    keywords_bigram text[],
    programming_languages text[]
  )
  AS
  $$
    SELECT
        a.href,
        a.title,
        a.content AS content_html,
        a.tags AS raw_tags_string,
        a.genre,
        a.publish_at AS published_at,
        a.author_href,
        u.name AS author_name,
        a.series_href,
        s.name AS series_name,
        a.series_no AS series_num,
        a.keywords_unigram,
        a.keywords_bigram,
        a.programming_languages
    FROM articles a
    LEFT JOIN users u
    ON a.author_href = u.href
    LEFT JOIN series s
    ON a.series_href = s.href
    ORDER BY a.href
    OFFSET "offset"
    LIMIT "limit";
  $$
  language sql;
