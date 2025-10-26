/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BarChartComponent({
  data,
  colorStroke,
  colorFill,
  title,
}: {
  data: any;
  colorStroke?: string;
  colorFill?: string;
  title?: string;
}) {
  return (
    <div className="w-full h-full">
      <h2 style={{ textAlign: "center", marginBottom: "0px" }}>{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={400}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="total"
            stroke={colorStroke ? colorStroke : "#d89f84"}
            fill={colorFill ? colorFill : "#ce3513"}
            fillOpacity={0.3}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
