import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import { parse } from "https://deno.land/std@0.149.0/flags/mod.ts";
import * as path from "https://deno.land/std@0.145.0/path/mod.ts";
import {
  HTMLDocument,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

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

const parseDOM = (() => {
  const it = new DOMParser();

  return (source: string) => {
    return it.parseFromString(source, "text/html");
  };
})();

const fetchDOM = async (href: string) => {
  // fetch by href
  const source = await fetch(href).then((res) => res.text());
  if (!source) {
    throw new Error(`fetch ${href} response is empty`);
  }

  // parser source string into DOM
  const document = parseDOM(source);
  if (!document) {
    throw new Error(`failed to parse source into dom`);
  }

  return document;
};

type HasQuerySelector = HTMLDocument | Element;
function DOM(el?: HasQuerySelector) {
  return {
    select: (query: string) => el?.querySelector(query) || undefined,

    selectAll: (query: string) =>
      Array.from(el?.querySelectorAll(query) || []) as Element[],
  };
}

const selectText = (query: string) => (el: HTMLDocument) =>
  DOM(el).select(query)?.textContent || undefined;

const selectAllText = (query: string) => (el: HTMLDocument) =>
  DOM(el)
    .selectAll(query)
    .map((el) => el.textContent)
    .filter(Boolean);

const selectHTML = (query: string) => (el: HTMLDocument) =>
  DOM(el).select(query)?.innerHTML || undefined;
const selectHref = (query: string) => (el: HTMLDocument) =>
  DOM(el).select(query)?.getAttribute("href") || undefined;

interface Article {
  href: string;
  title: string;
  content: string;
  tags: string[];
  genre: string;
  publish_at: string;
  author_href: string;
  series_href: string;
  series_no: string;
}

const extractArticle = (href: string) =>
  R.applySpec({
    href: R.always(href),
    genre: selectText(".qa-header .group__badge"),
    tags: selectAllText(".qa-header__tagGroup .tag"),
    title: selectText(".qa-header .qa-header__title"),
    publish_at: selectText(".qa-header .qa-header__info-time"),
    content: selectHTML(".qa-markdown .markdown"),
    series_no: selectText(
      ".qa-header .ir-article__topic > .ir-article__topic-count"
    ),
  });

const insertArticle = (db: DB, record: Partial<Article>) =>
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

interface Series {
  href: string;
  name: string;
}

const extractSeries = R.applySpec({
  href: selectHref(".qa-header .ir-article__topic > a"),
  name: selectText(".qa-header .ir-article__topic > a"),
});

const insertSeries = (db: DB, record: Partial<Series>) =>
  db.query(
    `
INSERT OR REPLACE INTO series
( href, name )
VALUES 
( :href, :name )
`,
    {
      href: record.href,
      name: record.name,
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
  href: selectHref(
    ".ir-article-info .ir-article-info__content .ir-article-info__name"
  ),
});

export const insertUser = (db: DB, record: Partial<User>) =>
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

const extract = (document: HTMLDocument) =>
  all(
    DOM(document)
      // get every href on list
      .selectAll(".qa-list__title-link")
      .map((el) => el.getAttribute("href"))
      .map((href) => {
        if (!href) return;

        console.log(`start extracting ${href}`);

        // extract page information
        return fetchDOM(href).then(
          R.applySpec({
            article: extractArticle(href),
            user: extractUser,
            series: extractSeries,
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

    // dispatch sub task with document
    yield document;

    // get next link
    href =
      DOM(document).select('a[rel="next"]')?.getAttribute("href") || undefined;

    // cold down time to prevent block by service
    await sleep(random(300, 700));
  }
}

interface Args {
  /** target website href for scraping */
  href: string;

  /** database path to write */
  database: string;
}
async function main({ database, href }: Args) {
  // init database
  const db = new DB(path.resolve(Deno.cwd(), database));

  // init tables
  const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

  await Deno.readFile(path.resolve(__dirname, `./init.sql`))
    .then(decode)
    .then((input) => db.query(input));

  // start from href and get back document per page
  for await (const document of scan(href)) {
    // extract information from document
    extract(document).then(
      R.forEach(async (information) => {
        if (!information) return;

        console.log(`insert ${information.article.href} into database`);

        // insert information into database
        await insertUser(db, information.user);
        await insertSeries(db, information.series);
        await await insertArticle(db, {
          ...information.article,
          author_href: information.user.href,
          series_href: information.series.href,
        });
      })
    );
  }
}

main(
  parse(Deno.args, {
    default: {
      href: "https://ithelp.ithome.com.tw/articles?tab=ironman",
      database: "test.db",
    },
  })
);
