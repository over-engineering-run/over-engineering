import { HTMLDocument } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import DOM from "./lib/dom.ts";

const query = (db: DB) => (input: string) => db.query(input);

const decode = (() => {
  const decoder = new TextDecoder("utf-8");

  return (buffer: Uint8Array) => decoder.decode(buffer);
})();

function random(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.random() * (max - min) + min;
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const all = Promise.all.bind(Promise);

const fetchDOM = async (href: string) => {
  // fetch by href
  const source = await fetch(href).then((res) => res.text());
  if (!source) {
    throw new Error(`fetch ${href} response is empty`);
  }

  // parser source string into DOM
  const document = DOM.parse(source);
  if (!document) {
    throw new Error(`failed to parse source into dom`);
  }

  return document;
};

const selectText = (query: string) => (el: HTMLDocument) =>
  DOM(el).select(query)?.textContent || undefined;
const selectHTML = (query: string) => (el: HTMLDocument) =>
  DOM(el).select(query)?.innerHTML || undefined;
const selectHref = (query: string) => (el: HTMLDocument) =>
  DOM(el).select(query)?.getAttribute("href") || undefined;

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

const extractArticle = (href: string) =>
  R.applySpec({
    href: R.always(href),
    genre: selectText(".qa-header .group__badge"),
    title: selectText(".qa-header .qa-header__title"),
    publish_at: selectText(".qa-header .qa-header__info-time"),
    content: selectHTML(".qa-markdown .markdown"),
    series: selectText(".qa-header .ir-article__topic > a"),
    series_no: selectText(
      ".qa-header .ir-article__topic > .ir-article__topic-count"
    ),
  });

const insertArticle = (db: DB, record: Partial<Article>) =>
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
const extractUser = R.applySpec({
  name: selectText(
    ".ir-article-info .ir-article-info__content .ir-article-info__name"
  ),
  href: selectHref(".ir-article-info .ir-article-info__content a"),
});

export const insertUser = (db: DB, record: Partial<User>) =>
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

const extract = (document: HTMLDocument) =>
  all(
    DOM(document)
      // get every href on list
      .selectAll(".qa-list__title-link")
      .map((el) => el.getAttribute("href"))
      .map((href) => {
        if (!href) return;

        // extract page information
        return fetchDOM(href).then(
          R.applySpec({
            article: extractArticle(href),
            user: extractUser,
          })
        );
      })
  );

async function* scan(href?: string): AsyncIterable<HTMLDocument> {
  // if we don't found next link, then break the loop
  while (href) {
    console.log(`start fetching ${href}`);

    // fetch by href
    const document = await fetchDOM(href);

    yield document;

    // get next link
    href =
      DOM(document).select('a[rel="next"]')?.getAttribute("href") || undefined;

    // cold down time to prevent block by service
    await sleep(random(500, 700));
  }
}

async function main() {
  // init database
  const db = new DB(Deno.cwd() + "/db/test.db");

  // init tables
  const tables = ["articles", "users"];
  await Promise.all(
    tables.map((table) =>
      Deno.readFile(Deno.cwd() + `/db/${table}.sql`)
        .then(decode)
        .then(query(db))
    )
  );

  for await (const document of scan(
    "https://ithelp.ithome.com.tw/articles?tab=ironman"
  )) {
    extract(document).then((results) => {
      results.forEach((result) => {
        if (!result) return;

        // insert into database
        return all([
          insertArticle(db, result.article),
          insertUser(db, result.user),
        ]);
      });
    });
  }
}

main();
