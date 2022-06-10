import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import Option from "./option.ts";
import { Fn } from "./types.ts";

interface Selectable {
  querySelectorAll: Element["querySelectorAll"];
  querySelector: Element["querySelector"];
}

const DOM = {
  parse: (() => {
    const it = new DOMParser();
    return (source: string) => it.parseFromString(source, "text/html");
  })(),

  selectAll:
    <A extends Selectable, B extends Element>(selector: string) =>
    (el: A) =>
      Array.from(el.querySelectorAll(selector)) as B[],

  select:
    <A extends Selectable, B extends Element>(selector: string) =>
    (el: A) =>
      el.querySelector(selector) as B,
  text: (el: Element) => el.textContent,
  html: (el: Element) => el.innerHTML,
  href: (el: Element) => el.getAttribute("href"),
};

export default DOM;

export const select =
  <T>(fn: Fn<Element, T>) =>
  (selector: string) =>
  (el: Element | HTMLDocument) =>
    Option.of(el)
      //
      .map(DOM.select(selector))
      .map(fn)
      .unwrap();

export const Select = {
  text: select(R.pipe(DOM.text, R.trim)),
  html: select(DOM.html),
  href: select(DOM.href),
};
