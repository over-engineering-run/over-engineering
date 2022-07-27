import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@reach/accordion";
import { groupBy, prop } from "ramda";
import Icon from "~/components/Icon";
import Search from "~/components/Search";
import Link from "~/components/Link";
import { useLoaderData } from "@remix-run/react";
import type { CommonProps } from "~/types";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { get } from "~/features/search";
import type { SearchResult } from "~/features/search";

type Result = SearchResult["results"][0];

const View = (props: Result & CommonProps) => (
  <div className={props.className}>
    <header className="space-y-2">
      {/* Hash Tags */}
      {props.hashtags.map((hashtag) => (
        <span key={hashtag} className="badge bg-orange">
          {hashtag}
        </span>
      ))}

      {/* Title */}
      <h2 className="text-lg text-blue">{props.title}</h2>
    </header>

    {/* Snippet */}
    <p className="py-2">{props.snippet}</p>
  </div>
);

type GroupProps = CommonProps & {
  title: Result["series"];
};
const Group = (props: GroupProps) => (
  <AccordionItem>
    <header className="space-y-2">
      {/* Title */}
      <AccordionButton className="flex w-full items-center justify-between py-4">
        <h2 className="text-xl">{props.title}</h2>

        <Icon.Chevron.Up className="h-6 w-6" />
        <Icon.Chevron.Down className="h-6 w-6" />
      </AccordionButton>
    </header>

    <AccordionPanel>{props.children}</AccordionPanel>
  </AccordionItem>
);

export const loader: LoaderFunction = get;

const groupBySeries = groupBy<Result, string>(prop("series"));

const Page = () => {
  const search_result = useLoaderData<SearchResult>();
  const results = groupBySeries(search_result.results);
  const count = search_result.count;

  return (
    <div className="[&>*]:px-8">
      <form className="pt-8">
        {/* Input */}
        <Search />

        {/* Category */}

        {/* Number of results found */}
        <p className="my-4">About {count} results</p>
      </form>

      <div>
        {/* People also search for */}

        {/* List of Search Results */}
        <Accordion>
          <ul className="space-y-2 divide-y divide-white">
            {Object.entries(results).map(([series, results]) => (
              <li key={series}>
                <Group title={series}>
                  <ul>
                    {results.map((result) => (
                      <li key={result.href}>
                        <Link type="tab" href={result.href}>
                          <View {...result} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Group>
              </li>
            ))}
          </ul>
        </Accordion>
      </div>
    </div>
  );
};

export default Page;
