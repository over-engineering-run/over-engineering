# Crawler

## Features
Extract article information from itman with deno.

We're using [Sqlite3] for local development,
And using [Supabase] for production,
which provide [postgres database][supabase_postgres].


Also, we using [GitHub Action][github_action] for job scheduling,
which will trigger crawler at 00:00 on Sunday.

## Feature List

### Crawler
- [x] Fetch information from page
- [x] Deserialize result into DOM
- [x] Extract information to structural data
- [x] Navigation by follow next link
- [x] Write into database

### Infrastructure
- [x] production database setup
- [x] RLS policies

### Cron Job
- [x] Action for execute job every sunday
- [x] Secure Key and Url


## Install

Install Deno on Mac

```sh
brew install deno
```

Install Supabase on Mac

```sh
brew install supabase/tap/supabase
```

## Script

fetch information from itman and write into database

```sh
deno run --allow-all main.ts --database <database-path>
```

## Need Help

If you being block, please contact project owner for help.


[Sqlite3]: https://www.sqlite.org/index.html
[Supabase]: https://supabase.com/
[supabase_postgres]: https://supabase.com/docs/guides/database
