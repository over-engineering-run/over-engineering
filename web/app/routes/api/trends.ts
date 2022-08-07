import type { LoaderFunction } from "@remix-run/server-runtime";
import {
  pipe,
  assoc,
  evolve,
  trim,
  map,
  flatten,
  range,
  groupWith,
  eqProps,
  sort,
  prop,
  descend,
  take,
  reduce,
} from "ramda";
import db from "~/db.server";

const count_by_genre_in_year = async (year: string) => {
  const { data, error } = await db.rpc("count_by_genre", { year: `${year}%` });

  if (error) throw error;

  return data.map(
    evolve({
      genre: trim,
    })
  );
};

//@ts-ignore
const byCount = descend(prop("count"));

const merge = reduce(
  (obj: any, { genre, count, year }) => ({
    ...obj,
    [genre]: count,
    x: year,
  }),
  {}
);

const getProgrammingLanguage = () =>
  Promise.all(
    range(2015, 2022)
      .map(String)
      .map((year) =>
        count_by_genre_in_year(year).then(map(assoc("year", year)))
      )
  )
    .then(flatten)
    .then(groupWith(eqProps("year")))
    //@ts-ignore
    .then(map(pipe(sort(byCount), take(5))))
    //@ts-ignore
    .then(map(merge));

export const loader: LoaderFunction = () => {
  return getProgrammingLanguage();
};
