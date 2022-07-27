/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Article";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "articles" (
    "href" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "series_no" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tag" TEXT,
    "genre" TEXT NOT NULL,
    "publish_at" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_href_key" ON "articles"("href");

-- CreateIndex
CREATE INDEX "articles_title_series_idx" ON "articles"("title", "series");
