import {
  DOMParser,
  Element,
  HTMLDocument,
  Node,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

type Fn<A, B> = (a: A) => B;
interface Option<A> {
  map<B>(fn: Fn<A, B>): Option<NonNullable<B>>;
  unwrap(): A;
}
const Some = <A>(value: A): Option<A> => ({
  map: <B>(fn: Fn<A, B>) => Option.of(fn(value)),
  unwrap: () => value,
});
const None = <A>(value: A): Option<A> => ({
  map: <B>(_fn: Fn<A, B>) => Option.of(value as unknown as B),
  unwrap: () => value,
});
const Option = {
  isNone: <A>(value: A) => value === undefined || value === null,
  of: <A>(value: A) =>
    (Option.isNone(value) ? None(value) : Some(value)) as Option<
      NonNullable<A>
    >,
};

const DOM = {
  parse: (() => {
    const it = new DOMParser();
    return (source: string) => it.parseFromString(source, "text/html");
  })(),

  selectAll:
    <T extends Node>(selector: string) =>
    (el: HTMLDocument) =>
      Array.from(el.querySelectorAll(selector)) as T[],

  select: (selector: string) => (el: Element) => el.querySelector(selector),
  text: (el: Element) => el.textContent,
  href: (el: Element) => el.getAttribute("href"),
};

const IO = {
  text: (res: Response) => res.text(),
  log: <T>(arg: T) => (console.log(arg), arg),
};

const List = {
  map:
    <A, B>(fn: Fn<A, B>) =>
    (list: A[]) =>
      list.map(fn),
  head: <A>(list: A[]) => list[0],
};

const String = {
  trim: (text: string) => text.trim(),
  match: (regex: RegExp) => (text: string) => text.match(regex),
};

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
  .then(IO.log);
