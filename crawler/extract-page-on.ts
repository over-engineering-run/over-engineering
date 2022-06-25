import DOM, { Select } from "../lib/dom.ts";
import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";

const TAG = "Extract Page";

interface Article {
  href: string;
  tag: string;
  series: string;
  series_no: string;
  title: string;
  publish_at: string;
  content: string;
}

interface User {
  name: string;
  href: string;
}

interface Page {
  article: Partial<Article>;
  user: Partial<User>;
}

const extractPageOn = async (url: string): Promise<Page> => {
  console.log(`${TAG}: fetch on ${url}`);

  const source = await fetch(url).then((res) => res.text());
  if (!source) {
    throw new Error(`${TAG}: response with empty string`);
  }

  const document = DOM.parse(source);
  if (!document) {
    throw new Error(`${TAG}: failed to parse source into dom`);
  }

  const article = R.applySpec({
    href: R.always(url),
    tag: Select.text(".qa-header .group__badge"),
    series: Select.text(".qa-header .ir-article__topic > a"),
    series_no: Select.text(
      ".qa-header .ir-article__topic > .ir-article__topic-count"
    ),
    title: Select.text(".qa-header .qa-header__title"),
    publish_at: Select.text(".qa-header .qa-header__info-time"),
    content: Select.html(".qa-markdown .markdown"),
  });
  const user = R.applySpec({
    name: Select.text(
      ".ir-article-info .ir-article-info__content .ir-article-info__name"
    ),
    href: Select.href(".ir-article-info .ir-article-info__content a"),
  });
  const page = R.applySpec({
    article,
    user,
  });

  console.log(`${TAG}: success extract page information on ${url}`);
  return page(document);
};

export default extractPageOn;
