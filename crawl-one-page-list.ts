import { Element } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import DOM from "./lib/dom.ts";
import IO from "./lib/io.ts";
import Option from "./lib/option.ts";
import List from "./lib/list.ts";
import String from "./lib/string.ts";

const getTextFrom = (selector: string, node: Element) =>
  Option.of(node)
    //
    .map(DOM.select(selector))
    .map(DOM.text)
    .map(String.trim);

const getHrefFrom = (selector: string, node: Element) =>
  Option.of(node)
    //
    .map(DOM.select(selector))
    .map(DOM.href)
    .map(String.trim);

fetch("https://ithelp.ithome.com.tw/2021ironman")
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(DOM.selectAll<Element>(".ir-index__list .ir-list"))
      .map(
        List.map((node) => ({
          title: getTextFrom(".ir-list__title", node).unwrap(),
          href: getHrefFrom(".ir-list__title > a", node).unwrap(),
          series: getTextFrom(".ir-list__group-topic", node).unwrap(),
          genre: getTextFrom(".ir-list__group > a", node).unwrap(),
          author: getTextFrom(".ir-list__name", node).unwrap(),
          publish_at: getTextFrom(".ir-list__info", node)
            .map(String.match(/\d{4}-\d{2}-\d{2}/))
            .map(List.head)
            .unwrap(),
        }))
      )
      .unwrap()
  )
  .then(IO.trace);
