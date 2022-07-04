# NLP

## Goal

- Search Engine
  - We want to build an search engine that provide basic search functionility
    against posts.
    - search keyword within author, title, content, and hashtag
    - filtering by hashtag, gerne, is_shit_post?, author
    - ordering by date, # of reply, and relevance
    - auto fill

## Issues

- search by keyword
  - Chinese and English
  - code block processing
    - <pre><code>
    - [improvement]: include code comment
  - ML -> search result should not have HTML

- statistic
  - trending: hashtags, posts/series
  - languages
  - keywords

- group by section

- [improvement]: search by question

- Model for Shit Post Classification
- Recommandation: related posts, series or articles

## NLP Processing Pipeline
### TODO
[ ] new class for pipeline param
[ ] extract text from HTML
[ ] extract code from <pre><code>
[ ] hashtag extraction
[ ] word tokenization and segmentation
[ ] stop word removal
[ ] (optional) keyword extraction
