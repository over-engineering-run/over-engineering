import DOM from "../lib/dom.ts";
import IO, { Url } from "../lib/io.ts";
import MATH from "../lib/math.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import extractPageListOn from "./extract-page-list-on.ts";
import extractPageOn from "./extract-page-on.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const forEachPage = (url: string) =>
  extractPageListOn(url)
    .then(R.map(extractPageOn))
    .then(Promise.all.bind(Promise))
    .then(console.log);

const TAG = "Iterate Each Page";

const next = async (page: number): Promise<number> => {
  console.log(`${TAG}: fetch on ${page}`);

  const href = Url.of({
    pathname: "https://ithelp.ithome.com.tw/2021ironman",
    query: { page },
  }).toString();

  forEachPage(href);

  const source = await fetch(href).then((res) => res.text());
  if (!source) {
    throw new Error(`${TAG}: response with empty string`);
  }

  console.log(`${TAG}: try to find next link on ${page}`);

  const document = DOM.parse(source);
  if (!document) {
    throw new Error(`${TAG}: failed to parse source into dom`);
  }

  const link = DOM.select('a[rel="next"]')(document);
  if (!link) return page;

  await wait(MATH.random(500, 700));
  return next(page);
};

next(1)
  .then(IO.log(`${TAG}: finish process`))
  .catch(IO.log(`${TAG}: error occured`));
