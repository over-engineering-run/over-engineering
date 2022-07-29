# NLP


## Goal: Search Engine

- Features
  - `Keyword Search`: **title**, **content**, **hashtag**
  - `Filter`: **hashtag** (optional: **time** and **is_shit_post?**)
  - `Auto Fill`: **hashtag** (optional: **extracted keywords** and **post title**)

- Optional Features
  - `Statistic`: to be discussed (maybe: **trending**, **programming
    languages**, **hashtags**, **posts/series** or **keywords**)
  - `Shit Post Detection`: to be discussed
  - `Recommendation`: to be discussed (**related post**, **series** or **articles**)

- Search Result
  - series
  - title
  - snippets
  - hashtag
  - reading time or readability

- Notes
  - `Keyword Search`
    - should not mix the search of **post**, **author** or **series**
    - **author** or **series** can directly link to it-ironmain page
  - `Filter`
    - should keep simple, and should not have **author** or **series** filtering
    - **author** or **series** filtering is quite trivial
    - direct links to it-ironmain page should be enough
  - `Auto Fill`
    - **hashtags** are generally summary of the topic or general meaning of a post
    - help users formulate their queries
  - `Keyword Search` vs `Filter`
    - example query: "learning `java` and `python`"
    - `Keyword Search`: Intersection and then Union
    - `Filter`: only Intersection


## Issues

- `Keyword Search`

  - multi-languages
    - Chinese and English

  - code block processing
    - \<pre\>\<code\>
    - improvement: include code comment during search

  - search result grouping
    - do we want to group the search result by series

- `Filter`

- `Auto Fill`


## Components

- Processing

- Indexing (Search Engine)

- Backend Server

- Search API
