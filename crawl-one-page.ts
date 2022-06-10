import IO from "./lib/io.ts";
import Option from "./lib/option.ts";
import DOM, { Select } from "./lib/dom.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";

fetch("https://ithelp.ithome.com.tw/articles/10259197")
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(
        R.applySpec({
          article: R.applySpec({
            tag: Select.text(".qa-header .group__badge"),
            series: Select.text(".qa-header .ir-article__topic > a"),
            series_no: Select.text(
              ".qa-header .ir-article__topic > .ir-article__topic-count"
            ),
            title: Select.text(".qa-header .qa-header__title"),
            publish_at: Select.text(".qa-header .qa-header__info-time"),
            content: Select.html(".qa-markdown .markdown"),
          }),

          user: R.applySpec({
            name: Select.text(
              ".ir-article-info .ir-article-info__content .ir-article-info__name"
            ),
            href: Select.href(".ir-article-info .ir-article-info__content  a"),
          }),
        })
      )
  )
  .then(
    Option.match({
      some: IO.trace,
      none: () => console.error("error: "),
    })
  );
