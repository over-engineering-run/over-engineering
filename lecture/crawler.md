# Crawler

## We need to collapse data from IThelp,

irst, we using `fetch` with url,
after getting result,
use `IO.text` to deserialize the text.
also declare `IO.log` utils for inspect the result

```typescript
const IO = {
  text: (res: Response) => res.text(),
  log: <T>(arg: T) => (console.log(arg), arg),
};

fetch(url)
  //
  .then(IO.text)
  .then(IO.log);
```

## Using [Deno DOM][deno_dom] to generate DOM structure

[deno_dom]: https://deno.land/manual/jsx_dom/deno_dom

```typescript
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";

const DOM = {
  parse: (() => {
    const it = new DOMParser();
    return (source: string) => it.parseFromString(source, "text/html");
  })(),
};

fetch(url)
  //
  .then(IO.text)
  .then(DOM.parse)
  .then(IO.log);
```

```
EventTarget {
  nodeName: "#document",
  ...
}
```

## DOM Selector

```typescript
const DOM = {
  ...

  selectAll: (selector: string) => (el: HTMLDocument) =>
    Array.from(el.querySelectorAll(selector)),
};

fetch(url)
  //
  .then(IO.text)
  .then(DOM.parse)
  .then(DOM.selectAll(selector)) // type error
  .then(IO.log);
```

## Using Option/Maybe handle empty

- `map`: map from `Option<A>` to `Option<B>`
- `unwrap`: extract value out

```typescript
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
```

```typescript
fetch(url)
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      //
      .map(DOM.parse)
      .map(DOM.selectAll(selector))
      .unwrap()
  )
  .then(IO.log);
```

```
[
  EventTarget {
    nodeName: "H3",
    ...
  },
  ...
]
```

## Extract all title into list

```typescript
const List = {
  map:
    <A, B>(fn: Fn<A, B>) =>
    (list: A[]) =>
      list.map(fn),
};
```

```typescript
const DOM = {
  ...

  selectAll:
    <T extends Node>(selector: string) =>
    (el: HTMLDocument) =>
      Array.from(el.querySelectorAll(selector)) as T[],

  select:
    (selector: string) =>
    (el: Element) =>
      el.querySelector(selector),

  text: (el: Element) => el.textContent,
};
```

```typescript
fetch(url)
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(DOM.selectAll<Element>(selector.item))
      .map(
        List.map((node) =>
          Option.of(node)
            //
            .map(DOM.select(selector.title))
            .map(DOM.text)
            .unwrap()
        )
      )
      .unwrap()
  )
  .then(IO.log);
```

```
[
  "【Day 30】再…再一年 - 完賽心得與瀏覽數分析",
  "[Day2] 抓取每日收盤價",
  "[Day1] 基本工具安裝",
  "Day 1 無限手套 AWS 版：掌控一切的 5 + 1 雲端必學主題",
  "[Day 15] 機器學習常勝軍 - XGBoost",
  "Day 3 雲端四大平台比較：AWS . GCP . Azure . Alibaba",
  " [Day13] 搶 PS5 程式怎麼寫? 動態爬蟲詳細教學!",
  "Day 2 AWS 是什麼？又為何企業這麼需要 AWS 人才？",
  "[履歷]用簡報讓面試官集中注意力",
  "利用python取得永豐銀行API的Nonce",
]
```

## Transform item into Record List

```typescript
const getTextBySelector = (selector: string, node: Element) =>
  Option.of(node)
    //
    .map(DOM.select(selector))
    .map(DOM.text);
```

```typescript
fetch(url)
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(DOM.selectAll<Element>(selector.item))
      .map(
        List.map((node) => ({
          title: getTextFrom(selector.title, node).unwrap(),
        }))
      )
      .unwrap()
  )
  .then(IO.log);
```

```
[
  { title: "【Day 30】再…再一年 - 完賽心得與瀏覽數分析" },
  ...
]
```

also, we can get href

```typescript
const getHrefFrom = (selector: string, node: Element) =>
  Option.of(node)
    //
    .map(DOM.select(selector))
    .map(DOM.href);
```

```typescript
fetch(url)
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(DOM.selectAll<Element>(selector.item))
      .map(
        List.map((node) => ({
          title: getTextFrom(selector.title, node).unwrap(),
          href: getHrefFrom(selector.href, node).unwrap(),
        }))
      )
      .unwrap()
  )
  .then(IO.log);
```

```
[
  {
    title: "【Day 30】再…再一年 - 完賽心得與瀏覽數分析",
    href: "https://ithelp.ithome.com.tw/articles/10281700"
  },
  ...
]
```

## Clean up our data

```typescript
const String = {
  trim: (text: string) => text.trim(),
};
```

```typescript
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
```

```typescript
fetch(url)
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(DOM.selectAll<Element>(selector.item))
      .map(
        List.map((node) => ({
          title: getTextFrom(selector.title, node).unwrap(),
          href: getHrefFrom(selector.href, node).unwrap(),
          series: getTextFrom(selector.series, node).unwrap(),
          genre: getTextFrom(selector.genre, node).unwrap(),
          author: getTextFrom(selector.author, node).unwrap(),
        }))
      )
      .unwrap()
  )
  .then(IO.log);
```

```
[
  {
    title: "【Day 30】再…再一年 - 完賽心得與瀏覽數分析",
    href: "https://ithelp.ithome.com.tw/articles/10281700",
    series: "現實主義勇者的 Windows 攻防記 系列",
    genre: "Security",
    author: "zeze",
  }
  ...
]
```

## Final Exam

```
[
  {
    ...
    publish_at: "2021-10-15"
  }
  ...
]
```

```typescript
const List = {
  ...
  head: <A>(list: A[]) => list[0],
};
const String = {
  ...
  match: (regex: RegExp) => (text: string) => text.match(regex),
};

fetch(url)
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      .map(DOM.parse)
      .map(DOM.selectAll<Element>(selector.item))
      .map(
        List.map((node) => ({
          title: getTextFrom(selector.title, node).unwrap(),
          href: getHrefFrom(selector.href, node).unwrap(),
          series: getTextFrom(selector.series, node).unwrap(),
          genre: getTextFrom(selector.genre, node).unwrap(),
          author: getTextFrom(selector.author, node).unwrap(),
          publish_at: getTextFrom(selector.publish_at, node)
            .map(String.match(/\d{4}-\d{2}-\d{2}/))
            .map(List.head)
            .unwrap(),
        }))
      )
      .unwrap()
  )
  .then(IO.log);
```
