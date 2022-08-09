CREATE TABLE IF NOT EXISTS "series" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "articles" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "genre" TEXT,
    "publish_at" TEXT NOT NULL,
    "author_href" TEXT,
    "series_href" TEXT NOT NULL,
    "series_no" TEXT NOT NULL,
    CONSTRAINT "articles_author_href_fkey" FOREIGN KEY ("author_href") REFERENCES "users" ("href") ON DELETE
    SET
        NULL ON UPDATE CASCADE,
        CONSTRAINT "articles_series_href_fkey" FOREIGN KEY ("series_href") REFERENCES "series" ("href") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "articles_href_key" ON "articles"("href");

CREATE INDEX "articles_title_idx" ON "articles"("title");

CREATE UNIQUE INDEX "series_href_key" ON "series"("href");

CREATE UNIQUE INDEX "users_href_key" ON "users"("href");
