# Itman Web Scraper

## Features
Extract article information from itman with deno.

We're using [Sqlite3] for local development,
And using [Supabase] for production,
which provide [postgres database][supabase_postgres] and [edge serverless function][supabase_edge_function].


Also, we using [GitHub Action][github_action] for job scheduling,
which will using [edge serverless function][supabase_edge_function] to trigger scraper at 00:00 on Sunday.

## Feature List

### Scraping
- [x] Fetch information from page
- [x] Deserialize result into DOM
- [x] Extract information to structural data
- [x] Navigation by follow next link
- [x] Write into database

### Infrastructure
- [x] production database setup
- [x] RLS policies
- [x] Edge function to trigger scraper job

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

## Control Panel

You can access database control panel on production by using [this link](https://app.supabase.com/project/dnfooecqcpcrhzocztxu).

## API

You can find [API Documentation](https://app.supabase.com/project/dnfooecqcpcrhzocztxu/api) here.

## Need Help

If you being block, please contact project owner for help.


[Sqlite3]: https://www.sqlite.org/index.html
[Supabase]: https://supabase.com/
[supabase_postgres]: https://supabase.com/docs/guides/database
[supabase_edge_function]: https://supabase.com/docs/guides/functions
