import IO from "./lib/io.ts";
import Option from "./lib/option.ts";
import DOM from "./lib/dom.ts";

fetch("https://ithelp.ithome.com.tw/articles/10259197")
  //
  .then(IO.text)
  .then((text) =>
    Option.of(text)
      //
      .map(DOM.parse)
      // .map(DOM.select())
      .unwrap()
  )
  .then(IO.trace);

//
// article {
//    tag: .qa-header .group__badge
//    series: .qa-header .ir-article__topic > a
//    series_no: .qa-header .ir-article__topic > .ir-article__topic-count
//    title: .qa-header .qa-header__title
//    publish_at: .qa-header .qa-header__info-time
//    content: .qa-markdown .markdown (html)
// }
//
// user: .ir-article-info {
//    name: .ir-article-info__content .ir-article-info__name
//    href: .ir-article-info__content > a (href)
// }
//
//
