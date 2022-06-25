import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";

const db = new DB("test.db");

const query = (db: DB) => (input: string) => db.query(input);

const decode = (() => {
  const decoder = new TextDecoder("utf-8");

  return (buffer: Uint8Array) => decoder.decode(buffer);
})();

// init table
const tables = ["articles", "users"];
await Promise.all(
  tables.map((table) =>
    Deno.readFile(Deno.cwd() + `/db/${table}.sql`)
      .then(decode)
      .then(query(db))
  )
);

// insert
interface Article {
  href: string;
  title: string;
  series: string;
  series_no: string;
  content: string;
  tag: string;
  genre: string;
  publish_at: string;
}
export const insertIntoArticles = (record: Partial<Article>) =>
  db.query(
    `
INSERT OR REPLACE INTO articles 
( href, title, series, series_no, content, tag,	genre, publish_at )
VALUES 
( :href, :title, :series, :series_no, :content, :tag, :genre, :publish_at )
`,
    {
      href: record.href,
      title: record.title,
      series: record.series,
      series_no: record.series_no,
      content: record.content,
      tag: record.tag,
      genre: record.genre,
      publish_at: record.publish_at,
    }
  );

interface User {
  href: string;
  name: string;
}
export const insertIntoUsers = (record: Partial<User>) =>
  db.query(
    `
INSERT OR REPLACE INTO users 
( href, name )
VALUES 
( :href, :name )
`,
    {
      href: record.href,
      name: record.name,
    }
  );
