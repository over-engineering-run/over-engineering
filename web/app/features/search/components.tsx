import clsx from "clsx";
import Icon from "~/components/Icon";
import type { CommonProps } from "~/types";
import type { SearchResult } from "../articles";

type Props = CommonProps &
  SearchResult & {
    maxShowHashTags?: number;
  };
export const Result = (props: Props) => {
  const maxShowHashTags = props.maxShowHashTags || 3;
  const tooMuchHashTags = props.hashtags.length - maxShowHashTags;
  const hashtags = props.hashtags.slice(0, maxShowHashTags);
  return (
    <div
      className={clsx(
        "w-full",
        "space-y-2 text-sm md:text-base",
        "px-4 py-6 lg:px-0",
        props.className
      )}
      style={props.style}
    >
      <div className="flex items-center justify-between">
        {/* Series */}
        <span>{props.series}</span>

        {/* Author */}
        {props.author && <span>{props.author.name}</span>}
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
        {props.snippet}
      </p>

      <footer className="flex items-center gap-2 pt-2">
        {/* Read Time */}
        <div className="flex items-center gap-1">
          <Icon.Book className="w-4" />

          <time>15 mins read</time>
        </div>

        {/* Hash Tags */}
        <ul className="flex gap-2">
          {hashtags.map((hashtag) => (
            <li key={hashtag}>
              <span className="solid-sm rounded border">{hashtag}</span>
            </li>
          ))}

          {tooMuchHashTags > 0 && (
            <li>
              <span className="solid-sm rounded border">
                {" "}
                + {tooMuchHashTags}
              </span>
            </li>
          )}
        </ul>
      </footer>
    </div>
  );
};
