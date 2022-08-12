import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import {
  HTMLDocument,
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
export { delay } from "https://deno.land/std@0.136.0/async/mod.ts";

export function random(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.random() * (max - min) + min;
}
const all = Promise.all.bind(Promise);

const parseDOM = (() => {
  const it = new DOMParser();

  return (source: string): HTMLDocument | null =>
    it.parseFromString(source, "text/html");
})();

export async function fetchDOM(href: string) {
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
}

const hasAttribute = (attribute: string) => (el: Element) =>
  el.hasAttribute(attribute);

const getAttribute = (attribute: string) => (el: Element) =>
  el.getAttribute(attribute);

const getSearchParam = (href: string, key: string) =>
  new URLSearchParams(href).get(key) || undefined;

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
      .map(getAttribute("href"))
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

          console.log(
            `get information from ${information.article.href} successful...`
          );
        } catch (error) {
          console.error(error);
        }
      })
    )
    .then(all);

export const getEndLink = (href: string) =>
  fetchDOM(href).then((document) =>
    DOM(document)
      .selectAll(".pagination > li > *")
      .filter(hasAttribute("href"))
      .map(getAttribute("href"))
      .map((href) => ({
        href,
        page: Number(getSearchParam(href!, "page")),
      }))
      .reduce((pre, cur) => (cur.page > pre.page ? cur : pre), { page: -1 })
  );
