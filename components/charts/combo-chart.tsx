"use client";

import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ComboPoint {
  label: string;
  canbus: number;
  fill: number;
}

export function FuelComboChart({ data }: { data: ComboPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="canbusGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(222 64% 38%)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(222 64% 38%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(32 82% 55%)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="hsl(32 82% 55%)" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 90%)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(220 9% 45%)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 45%)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(220 14% 90%)",
            boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar dataKey="fill" name="Abastecimentos (L)" fill="url(#fillGrad)" radius={[4, 4, 0, 0]} />
        <Area
          type="monotone"
          dataKey="canbus"
          name="Consumo CANBUS (L)"
          stroke="hsl(222 64% 38%)"
          strokeWidth={2}
          fill="url(#canbusGrad)"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
