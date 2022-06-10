import {
  DOMParser,
  Element,
  HTMLDocument,
  Node,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

export default {
  parse: (() => {
    const it = new DOMParser();
    return (source: string) => it.parseFromString(source, "text/html");
  })(),

  selectAll:
    <T extends Node>(selector: string) =>
    (el: HTMLDocument) =>
      Array.from(el.querySelectorAll(selector)) as T[],

  select: (selector: string) => (el: Element | HTMLDocument) =>
    el.querySelector(selector),
  text: (el: Element) => el.textContent,
  href: (el: Element) => el.getAttribute("href"),
};
