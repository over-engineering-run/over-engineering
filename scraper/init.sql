CREATE TABLE IF NOT EXISTS "articles" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "series_no" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "genre" TEXT,
    "publish_at" TEXT NOT NULL,
    "author_href" TEXT,
    CONSTRAINT "articles_author_href_fkey" FOREIGN KEY ("author_href") REFERENCES "users" ("href") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "users" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
CREATE UNIQUE INDEX "articles_href_key" ON "articles"("href");
CREATE INDEX "articles_title_series_idx" ON "articles"("title", "series");
CREATE UNIQUE INDEX "users_href_key" ON "users"("href");
