/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// import { curveCardinal } from "d3-shape";

export default function AreaChartComponent({
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
  //   const cardinal = curveCardinal.tension(0.2);
  return (
    <div className="w-full h-full">
      <h2 style={{ textAlign: "center", marginBottom: "0px" }}>{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
          <Area
            type="bump"
            dataKey="total"
            stroke={colorStroke ? colorStroke : "#8884d8"}
            fill={colorFill ? colorFill : "#8884d8"}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
