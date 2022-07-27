-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "series_no" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tag" TEXT,
    "genre" TEXT,
    "publish_at" TEXT NOT NULL
);
INSERT INTO "new_articles" ("content", "genre", "href", "publish_at", "series", "series_no", "tag", "title") SELECT "content", "genre", "href", "publish_at", "series", "series_no", "tag", "title" FROM "articles";
DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
CREATE UNIQUE INDEX "articles_href_key" ON "articles"("href");
CREATE INDEX "articles_title_series_idx" ON "articles"("title", "series");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
