import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import { parse } from "https://deno.land/std@0.149.0/flags/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";
import { Article, extract, scan, Series, User } from "./lib.ts";

const insertArticle = (db: DB) => async (record: Partial<Article>) =>
  db.query(
    `
INSERT OR REPLACE INTO articles
( href, title, series_href, series_no, content, tags, genre, publish_at, author_href )
VALUES
( :href, :title, :series_href, :series_no, :content, :tags, :genre, :publish_at, :author_href )
`,
    {
      href: record.href,
      title: record.title,
      content: record.content,
      tags: record.tags?.join(),
      genre: record.genre,
      publish_at: record.publish_at,
      author_href: record.author_href,
      series_href: record.series_href,
      series_no: record.series_no,
    }
  );

const insertSeries = (db: DB) => async (record: Partial<Series>) =>
  db.query(
    `
INSERT OR IGNORE INTO series
( href, name )
VALUES
( :href, :name )
`,
    {
      href: record.href,
      name: record.name,
    }
  );

export const insertUser = (db: DB) => async (record: Partial<User>) =>
  db.query(
    `
INSERT OR IGNORE INTO users
( href, name )
VALUES
( :href, :name )
`,
    {
      href: record.href,
      name: record.name,
    }
  );

/** target website href for scraping */
const href = "https://ithelp.ithome.com.tw/articles?tab=ironman";

interface Args {
  /** database path to write */
  database: string;
}
async function main({ database }: Args) {
  // init database
  const db = new DB(path.resolve(Deno.cwd(), database));

  // init tables
  const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const tables = await Deno.readTextFile(path.resolve(__dirname, `./init.sql`))
    .then(R.split(";"))
    .then(R.slice(0, -1));
  for (const table of tables) {
    await db.query(table + ";");
  }

  // start from href and get back document per page
  for await (const document of scan(href)) {
    // extract information from document
    extract(document, {
      user: insertUser(db),
      series: insertSeries(db),
      article: insertSeries(db),
    }).then(() => console.log(`scraping ${href} information successful...`));
  }
}

main(
  parse(Deno.args, {
    default: {
      database: "test.db",
    },
  })
);
