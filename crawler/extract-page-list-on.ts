import DOM from "../lib/dom.ts";

const TAG = "Extract Page List";

const extractPageListOn = async (url: string): Promise<string[]> => {
  console.log(`${TAG}: fetch on ${url}`);

  const source = await fetch(url).then((res) => res.text());
  if (!source) {
    throw new Error(`${TAG}: response with empty string`);
  }

  console.log(`${TAG}: extract list information on ${url}`);

  const document = DOM.parse(source);
  if (!document) {
    throw new Error(`${TAG}: failed to parse source into dom`);
  }

  const records =
    //
    DOM.selectAll(".ir-index__list .ir-list .ir-list__title > a")(document)
      //
      .map(DOM.href)
      .filter(Boolean) as string[];

  console.log(`${TAG}: success extract list information on ${url}`);

  return records;
};

export default extractPageListOn;
