import DOM from "../lib/dom.ts";
import IO, { Url } from "../lib/io.ts";
import Option from "../lib/option.ts";
import MATH from "../lib/math.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import extractPageListOn from "./extract-page-list-on.ts";
import extractPageOn from "./extract-page-on.ts";
import Task from "../lib/task.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const forEachPage = (url: string) =>
  Task.of(url)
    .map(extractPageListOn)
    .fork({
      ok: R.map((item) =>
        Option.of(item)
          //
          .map(R.prop("href"))
          .map(extractPageOn)
          .unwrap()
      ),
      err: Promise.reject,
    });

const TAG = "Iterate Each Page";

const next = (page: number): Promise<number> =>
  Promise.resolve({
    pathname: "https://ithelp.ithome.com.tw/2021ironman",
    query: { page },
  })
    .then(IO.tag(`${TAG}: fetch on ${page}`))
    .then(R.pipe(Url.of, String))
    .then(R.tap(forEachPage))
    .then(fetch)
    .then(IO.text)

    .then(IO.tag(`${TAG}: try to find next link on ${page}`))
    .then((text) =>
      Option.of(text)
        .map(DOM.parse)
        .map(DOM.select('a[rel="next"]'))
        .match({
          some: () =>
            wait(MATH.random(500, 700))
              //
              .then(() => next(page + 1)),
          none: () => page,
        })
    );

next(1)
  .then(IO.log(`${TAG}: finish process`))
  .catch(IO.log(`${TAG}: error occured`));
