## Install

```sh
brew install deno
```

## Script

- fetch information on ironman and save into database

```sh
deno run --allow-all main.ts --database <database-path>
```

## Tasks

- [x] fetch page
- [x] deserialize result into DOM
- [x] extract information
- [x] apply to structural data
- [x] find next link on page
- [x] save to database

## sqlite

### `.sqliterc`

.mode table
.width auto
.headers on
.nullvalue NULL
