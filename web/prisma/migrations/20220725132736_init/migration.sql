-- CreateTable
CREATE TABLE "Article" (
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
CREATE UNIQUE INDEX "Article_href_key" ON "Article"("href");
