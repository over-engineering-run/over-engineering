import { map } from "ramda";
import { db } from "~/utils/db.server";
import { parse as parse_html } from "node-html-parser";
import { parse as parse_date, format } from "date-fns";

const format_date = (source: string) => {
  const date = parse_date(source, "yyyy-MM-dd HH:mm:ss", new Date());

  return format(date, "dd MMM yyyy");
};

const deduplicate = <T>(list: T[]): T[] => Array.from(new Set(list));

export interface SearchResult {
  href: string;
  title: string;
  series: {
    href: string;
    name: string;
  };
  hashtags: string[];
  snippet: string;
  publish_at: string;
  author?: {
    href: string;
    name: string;
  };
}

type SearchProps = {
  query: string;
  skip?: number;
  take?: number;
};
export const search = ({ query, skip, take }: SearchProps) =>
  db.article
    .findMany({
      select: {
        href: true,
        title: true,
        series: true,
        tags: true,
        publish_at: true,
        content: true,
      },

      where: {
        title: {
          contains: query,
        },
      },

      skip,
      take,
    })
    .then(
      map((result) => ({
        href: result.href.trim(),
        title: result.title.trim(),
        series: {
          href: result.series.href.trim(),
          name: result.series.name.trim(),
        },
        hashtags: deduplicate(result.tags?.split(",") || []),
        publish_at: format_date(result.publish_at),
        snippet: parse_html(result.content).textContent.trim().slice(50),
      }))
    );

export const count = ({ query }: SearchProps) =>
  db.article.count({
    where: {
      title: {
        contains: query,
      },
    },
  });

export default {
  search,
  count,
};
