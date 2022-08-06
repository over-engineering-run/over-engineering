import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import {
  HTMLDocument,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

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

export interface Article {
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

export interface Series {
  href: string;
  name: string;
}
const extractSeries = R.applySpec({
  href: selectHref(".qa-header .ir-article__topic > a"),
  name: selectText(".qa-header .ir-article__topic > a"),
});

export interface User {
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

type InsertProxy = {
  user: (user: Partial<User>) => Promise<unknown>;
  series: (series: Partial<Series>) => Promise<unknown>;
  article: (article: Partial<Article>) => Promise<unknown>;
};
export const extract = (document: HTMLDocument, insert: InsertProxy) =>
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
            series: extractSeries,
          })
        );
      })
  )
    .then(
      R.map(async (information) => {
        if (!information) return;

        // insert information into database
        try {
          await insert.user(information.user);
          await insert.series(information.series);
          await insert.article({
            ...information.article,
            author_href: information.user.href,
            series_href: information.series.href,
          });
        } catch (error) {
          console.error(error);
        }

        console.log(
          `get information from ${information.article.href} successful...`
        );
      })
    )
    .then(all);

export async function* scan(href?: string): AsyncIterable<HTMLDocument> {
  try {
    // if we don't found next link, then break the loop
    while (href) {
      console.log(`start scan ${href}...`);

      // fetch by href
      const document = await fetchDOM(href);

      // dispatch sub task with document
      yield document;

      // get next link
      href =
        DOM(document).select('a[rel="next"]')?.getAttribute("href") ||
        undefined;

      // cold down time to prevent block by service
      await sleep(random(300, 700));
    }
  } catch (error) {
    console.error(error);
  }
}
