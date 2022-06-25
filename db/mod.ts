import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import extractPageOn from "../crawler/extract-page-on.ts";

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
const insertIntoArticles = (record: Partial<Article>) =>
  db.query(
    `
INSERT INTO articles 
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
const insertIntoUsers = (record: Partial<User>) =>
  db.query(
    `
INSERT INTO users 
( href, name )
VALUES 
( :href, :name )
`,
    {
      href: record.href,
      name: record.name,
    }
  );

extractPageOn("https://ithelp.ithome.com.tw/articles/10281700")
  //
  .then(({ article, user }) =>
    Promise.all([
      insertIntoUsers(user),
      insertIntoArticles(article),
      //
    ])
  );
