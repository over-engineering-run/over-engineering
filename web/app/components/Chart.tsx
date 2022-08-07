import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { CommonProps } from "~/types";
import clsx from "clsx";

type ChartProps = CommonProps & {
  data: any[];
};
const Chart = (props: ChartProps) => (
  <div className={props.className}>
    <ResponsiveContainer>
      <LineChart
        data={props.data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip
          content={({ active, payload, label }) =>
            active &&
            payload &&
            payload.length && (
              <div
                className={clsx(
                  "rounded bg-slate-200/20 p-4 shadow backdrop-blur",
                  "grid gap-1"
                )}
              >
                <strong>{label}</strong>

                <hr className="mb-2 border-slate-500" />

                {payload.map((data) => (
                  <p key={data.name}>{`${data.name} : ${data.value}`}</p>
                ))}
              </div>
            )
          }
        />

        {props.children}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default Chart;
