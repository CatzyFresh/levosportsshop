"use client";
import { formatINR } from "@/lib/money";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueChartItem = {
  month: string;
  revenue: number;
};

type DashboardRevenueChartProps = {
  data: RevenueChartItem[];
};

export default function DashboardRevenueChart({
  data,
}: DashboardRevenueChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />

          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />

          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => formatINR(Number(value))}
          />

          <Tooltip
            cursor={{ fill: "rgba(6,182,212,0.08)" }}
            formatter={(value) => [formatINR(Number(value)), "Revenue"]}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: "white",
            }}
          />

          <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#06b6d4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}