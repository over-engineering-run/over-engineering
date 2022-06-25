import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
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
    (el: A): B[] =>
      Array.from(el.querySelectorAll(selector)) as B[],

  select:
    <A extends Selectable, B extends Element>(selector: string) =>
    (el: A): B | undefined =>
      (el.querySelector(selector) as B) || undefined,
  text: (el: Element) => el.textContent,
  html: (el: Element) => el.innerHTML,
  href: (el: Element) => el.getAttribute("href") || undefined,
};

export default DOM;

export const select =
  <T>(fn: Fn<Element, T>) =>
  (selector: string) =>
  (el: Element | HTMLDocument) => {
    const element = DOM.select(selector)(el);

    if (!element) return undefined;

    return fn(element);
  };

export const Select = {
  text: select(R.pipe(DOM.text, R.trim)),
  html: select(DOM.html),
  href: select(DOM.href),
};
