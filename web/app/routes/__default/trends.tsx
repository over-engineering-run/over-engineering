import Section from "~/components/Section";
import { Line, Legend } from "recharts";
import { chain, equals, keys, pipe, reject, uniq } from "ramda";
import useFetcherLoad from "~/utils/useFetcherLoad";
import { useState } from "react";
import Chart from "~/components/Chart";
import circular from "~/utils/circular";
import clsx from "clsx";

const colors = circular([
  "#00429d",
  "#4771b2",
  "#73a2c6",
  "#a5d5d8",
  "#ffffe0",
  "#ffbcaf",
  "#f4777f",
  "#cf3759",
  "#93003a",
]);

const PopularCategories = () => {
  const data = useFetcherLoad("/api/trends");

  const keyFn = pipe(
    chain(
      pipe(
        keys,
        reject(equals("x"))
        //
      )
    ),
    uniq
  );

  const [hover, setHover] = useState<string>();

  return (
    <div className="card-layer relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-500/20 backdrop-blur-lg" />

      <Chart className="z-10 h-[80vh] w-full p-12 pl-0" data={data}>
        {data &&
          keyFn(data).map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors(index)}
              strokeOpacity={hover === undefined ? 1 : hover === key ? 1 : 0.2}
              activeDot={{ r: 8 }}
            />
          ))}

        <Legend
          onMouseEnter={(data) => setHover(data.dataKey)}
          onMouseLeave={() => setHover(undefined)}
        />
      </Chart>
    </div>
  );
};

const Trends = () => (
  <>
    <img
      className="fixed bottom-0 right-0 w-[90%] opacity-20"
      src="https://survey.stackoverflow.co/2022/hero.bfb84f73.svg"
      alt="background image"
      role="presentation"
    />

    <div className="mx-auto max-w-screen-md lg:max-w-screen-lg">
      <Section className="grid h-screen content-center gap-4">
        <div
          className={clsx(
            "grid gap-4 rounded-lg p-16",
            "bg-slate-700/80",
            "shadow-lg shadow-black"
            //
          )}
        >
          <h1 className="text-gradient text-5xl font-semibold">
            The State of Developer Ecosystem
          </h1>

          <p className="text-2xl">
            In May 2022 over 70,000 developers told us how they learn and level
            up, which tools they’re using, and what they want.
          </p>
        </div>
      </Section>

      <Section className="h-screen">
        <h2 className="mb-8 text-4xl font-semibold">Popular Categories</h2>
        <PopularCategories />
      </Section>
    </div>
  </>
);

export default Trends;
