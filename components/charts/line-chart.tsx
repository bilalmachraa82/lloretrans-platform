"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Point {
  label: string;
  value: number;
}

export function SimpleLineChart({ data, yLabel }: { data: Point[]; yLabel?: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(222 64% 38%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(222 64% 38%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 90%)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(220 9% 45%)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(220 9% 45%)" }}
          axisLine={false}
          tickLine={false}
          label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(220 9% 45%)" } : undefined}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(220 14% 90%)",
            boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(222 64% 38%)"
          strokeWidth={2}
          fill="url(#lineGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(222 64% 38%)", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
