import { useEffect, useState } from "react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { promiseHash, redirectBack } from "remix-utils";
import VirtualList from "~/components/VirtualList";
import clsx from "clsx";
import Icon from "~/components/Icon";
import type { CommonProps } from "~/types";
import db from "~/db.server";
import { evolve, join, map, pipe, prop, slice, split, trim } from "ramda";
import parse from "node-html-parser";
import * as datefns from "date-fns";

interface SearchResult {
  series: {
    name: string;
    href: string;
  };
  tags: string[];
  users: {
    name: string;
    href: string;
  };
  href: string;
  title: string;
  publish_at: string;
  content: string;
}

type SearchProps = {
  query: string;
  skip: number;
  take: number;
};
const search = async ({ query, skip, take }: SearchProps) => {
  const { data, error } = await db
    .from("articles")
    .select(
      `
        href,
        title,
        publish_at,
        content,
        tags,
        users ( name, href ),
        series ( name, href )
    `
    )
    .textSearch("title", query)
    .range(skip, skip + take);

  if (error) throw error;
  return data;
};

const count = async ({ query }: Pick<SearchProps, "query">) => {
  const { error, count } = await db
    .from("articles")
    .select("href", { count: "exact", head: true })
    .textSearch("title", query);

  if (error) throw error;
  return count;
};

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
      query: Promise.resolve(query),
      results: search({ query, skip, take }).then(
        map(
          evolve({
            title: trim,
            tags: JSON.parse,
            publish_at: (source: string) => {
              const date = datefns.parse(
                source,
                "yyyy-MM-dd HH:mm:ss",
                new Date()
              );
              return datefns.format(date, "dd MMM yyyy");
            },
            content: pipe(
              parse,
              prop("textContent"),
              trim,
              //@ts-ignore
              split("\n"),
              slice(0, 30),
              join("\n")
              //
            ),
            users: evolve({
              name: trim,
            }),
          })
        )
      ),
      count: count({ query }),
    })
      //
      .then(json)
  );
};

type Props = CommonProps &
  SearchResult & {
    maxShowHashTags?: number;
  };
export const Result = (props: Props) => {
  const maxShowHashTags = props.maxShowHashTags || 3;
  const tooMuchHashTags = props.tags.length - maxShowHashTags;
  const hashtags = props.tags.slice(0, maxShowHashTags);
  return (
    <div
      className={clsx("relative w-full", props.className)}
      style={props.style}
    >
      <div className="relative space-y-2 text-sm md:text-base">
        <div className="flex items-center gap-2">
          {/* Series */}
          <a href={props.series.href} target="_blank" rel="noopener noreferrer">
            {props.series.name}
          </a>

          {/* Author */}
          {props.users && (
            <>
              <span> — </span>
              <a
                href={props.series.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.users.name}
              </a>
            </>
          )}
        </div>

        {/* Title */}
        <h2
          className={clsx(
            "pb-1 font-bold",
            "text-xl md:text-2xl"
            //
          )}
        >
          <a href={props.href} target="_blank" rel="noopener noreferrer">
            {props.title}
          </a>
        </h2>

        {/* Snippet */}
        <p className="text-primary-2 line-clamp-3">
          <time>{props.publish_at} — </time>
          {props.content}
        </p>

        <footer className="flex flex-col gap-2 pt-2">
          {/* Read Time */}
          <div className="flex items-center gap-1">
            <Icon.Book className="w-4" />

            <time>15 mins read</time>
          </div>

          {/* Hash Tags */}
          <ul className="flex flex-wrap gap-2">
            {hashtags.map((hashtag) => (
              <li key={hashtag} className="mt-2">
                <span className="solid-sm rounded border">{hashtag}</span>
              </li>
            ))}

            {tooMuchHashTags > 0 && (
              <li className="mt-2">
                <span className="solid-sm rounded border">
                  {" "}
                  + {tooMuchHashTags}
                </span>
              </li>
            )}
          </ul>
        </footer>
      </div>
    </div>
  );
};

interface Data {
  query: string;
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
      const params = new URLSearchParams();
      params.set("skip", String(from));
      params.set("take", String(COUNT_PER_PAGE));
      params.set("q", String(data.query));
      fetcher.load(`/search?${params.toString()}`);
    }
  }, [fetcher.state, fetcher.load, from, results.length, data.query]);

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
        size={300}
        style={{
          height: `${listHeight}px`,
        }}
        count={results.length}
        onReachEnd={() => {
          if (fetcher.state === "loading") return;
          setFrom(results.length + COUNT_PER_PAGE);
        }}
        hasNext={results.length >= data.count}
        loadingSize={134}
        loading={
          <div className="grid w-full place-content-center lg:ml-44 lg:max-w-screen-md">
            <Icon.Loading
              className="h-12 w-12 text-purple-400"
              stroke="currentColor"
            />
          </div>
        }
      >
        {(index) => (
          <Result
            className="px-4 lg:ml-44 lg:max-w-screen-md lg:px-0"
            {...results[index]}
          />
        )}
      </VirtualList>
    </div>
  );
};

export default Page;
