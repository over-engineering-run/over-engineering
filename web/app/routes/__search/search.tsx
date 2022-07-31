import { useEffect, useState } from "react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { promiseHash, redirectBack } from "remix-utils";
import articles from "~/features/articles";
import { Result } from "~/features/search/components";
import VirtualList from "~/components/VirtualList";
import type { SearchResult } from "~/features/articles";

const COUNT_PER_PAGE = 20;

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);

  const query = url.searchParams.get("q");
  if (!query) return redirectBack(request, { fallback: "/" });

  const _skip = url.searchParams.get("skip");
  const skip = _skip ? Number(_skip) : 0;

  const _take = url.searchParams.get("take");
  const take = _take ? Number(_take) : COUNT_PER_PAGE;

  return (
    promiseHash({
      results: articles.search({ query, skip, take }),
      count: articles.count({ query }),
    })
      //
      .then(json)
  );
};

interface Data {
  results: SearchResult[];
  count: number;
}
const Page = () => {
  const data = useLoaderData<Data>();
  const [results, setResults] = useState(data.results);

  const fetcher = useFetcher();
  useEffect(() => {
    if (!fetcher.data) return;

    setResults((prevItems) => [...prevItems, ...fetcher.data.results]);
  }, [fetcher.data]);

  const [from, setFrom] = useState(0);
  useEffect(() => {
    if (fetcher.state === "loading") return;

    if (from > results.length) {
      fetcher.load(`/search?skip=${from}&take=${COUNT_PER_PAGE}`);
    }
  }, [fetcher.state, fetcher.load, from, results.length]);

  const [listHeight, setListHeight] = useState(0);

  return (
    <div className="flex flex-col">
      {/* Number of results found */}
      <p
        className="my-4 px-4 lg:ml-44 lg:px-0"
        ref={(ref) => {
          if (!ref) return;

          const height =
            window.innerHeight - ref.getBoundingClientRect().bottom;
          setListHeight(height);
        }}
      >
        About {data.count} results
      </p>

      {/* List of Search Results */}
      <VirtualList
        size={268}
        style={{
          height: `${listHeight}px`,
        }}
        count={results.length}
        onReachEnd={() => {
          if (fetcher.state === "loading") return;
          setFrom(results.length + COUNT_PER_PAGE);
        }}
      >
        {(index) => (
          <Result className="lg:ml-44 lg:max-w-screen-md" {...results[index]} />
        )}
      </VirtualList>
    </div>
  );
};

export default Page;
