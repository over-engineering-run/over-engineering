import DOM, { Select } from "../lib/dom.ts";
import IO from "../lib/io.ts";
import Option from "../lib/option.ts";
import Task from "../lib/task.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";

const TAG = "Extract Page List";

const extractPageListOn = (url: string) =>
  Task.of()
    .map(IO.tag(`${TAG}: fetch on ${url}`))
    .map(IO.fetch(url))
    .map(IO.text)

    .map(IO.tag(`${TAG}: extract list information on ${url}`))
    .map((text) =>
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
              publish_at: (el) =>
                Option.of(el)
                  .map(Select.text(".ir-list__info"))
                  .map(R.match(/\d{4}-\d{2}-\d{2}/))
                  .map(R.head)
                  .unwrap(),
            })
          )
        )
        .match({
          some: R.identity,
          none: IO.error(`failed on extract list information`),
        })
    )

    .fork({
      ok: IO.log(`${TAG}: success extract list information on ${url}`),
      err: IO.log(`${TAG}: failed on ${url}`),
    });

export default extractPageListOn;
