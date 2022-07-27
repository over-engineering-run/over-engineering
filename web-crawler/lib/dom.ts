import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

const it = new DOMParser();

export function parse(source: string) {
  return it.parseFromString(source, "text/html");
}

type HasQuerySelector = HTMLDocument | Element;
export function DOM(el?: HasQuerySelector) {
  return {
    select: (query: string) => el?.querySelector(query) || undefined,

    selectAll: (query: string) =>
      Array.from(el?.querySelectorAll(query) || []) as Element[],
  };
}

DOM.parse = parse;

export default DOM;
