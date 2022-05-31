import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

type Fn<A, B> = (a: A) => B;
interface Option<A> {
  isNone(): boolean;
  map<B>(fn: Fn<A, B>): Option<NonNullable<B>>;
  unwrap(): A;
}
const Some = <A>(value: A): Option<A> => ({
  isNone: () => false,
  map: <B>(fn: Fn<A, B>) => Option.of(fn(value)),
  unwrap: () => value,
});
const None = <A>(value: A): Option<A> => ({
  isNone: () => true,
  map: <B>(_fn: Fn<A, B>) => Option.of(value as unknown as B),
  unwrap: () => value,
});
const Option = {
  isNone: <A>(value: A) => value === undefined || value === null,

  of: <A>(value: A) =>
    (Option.isNone(value) ? None(value) : Some(value)) as Option<
      NonNullable<A>
    >,

  match:
    <X, Y, F extends { none: Fn<A, X>; some: Fn<A, Y> }, A>(handle: F) =>
    (option: Option<A>) =>
      option.isNone()
        ? handle.none(option.unwrap())
        : handle.some(option.unwrap()),
};

const DOM = {
  parse: (() => {
    const it = new DOMParser();
    return (source: string) => it.parseFromString(source, "text/html");
  })(),

  select: (selector: string) => (el: Element | HTMLDocument) =>
    el.querySelector(selector),
};

const Task = {
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

const IO = {
  text: (res: Response) => res.text(),
  trace: <T>(arg: T) => (console.log(arg), arg),
  log:
    (msg: string) =>
    <T>(arg: T) => (console.log(msg), arg),
  fetch: (url: string) => () => fetch(url),
};

const MATH = {
  random: (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.random() * (max - min) + min;
  },
};

const next = (page: number): Promise<number> =>
  Task.wait(MATH.random(500, 700))
    .then(IO.log(`Start: fetch ${page}`))
    .then(IO.fetch(`https://ithelp.ithome.com.tw/2021ironman?page=${page}`))
    .then(IO.log(`Success: fetch ${page}`))
    .then(IO.text)
    .then((text) =>
      Option.of(text)
        //
        .map(DOM.parse)
        .map(DOM.select('a[rel="next"]'))
    )
    .then(
      Option.match({
        some: () => next(page + 1),
        none: () => page,
      })
    );

next(1).then(console.log);
