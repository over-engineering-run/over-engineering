import DOM, { Select } from "../lib/dom.ts";
import IO from "../lib/io.ts";
import Option from "../lib/option.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";

const TAG = "Extract Page List";

export const extractPageListOn = (url: string) =>
  Promise.resolve()
    .then(IO.tag(`${TAG}: fetch on ${url}`))
    .then(IO.fetch(url))
    .then(IO.text)

    .then(IO.tag(`${TAG}: extract list information on ${url}`))
    .then((text) =>
      Option.of(text)
        .map(DOM.parse)
        .map(DOM.selectAll(".ir-index__list .ir-list"))
        .map(
          R.map(
            R.applySpec({
              title: Select.text(".ir-list__title"),
              href: Select.href(".ir-list__title > a"),
              series: Select.text(".ir-list__group-topic"),
              genre: Select.text(".ir-list__group > a"),
              author: Select.text(".ir-list__name"),
              publish_at: R.pipe(
                Select.text(".ir-list__info"),
                R.match(/\d{4}-\d{2}-\d{2}/),
                R.head
              ),
            })
          )
        )
    )

    .then(
      Option.match({
        some: IO.log(`${TAG}: success extract list information on ${url}`),
        none: IO.log(`${TAG}: failed on ${url}`),
      })
    );
