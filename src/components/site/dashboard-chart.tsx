"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartData = {
  month: string;
  orders: number;
  spent: number;
};

export function DashboardChart({ data }: { data: ChartData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-[#fafafa]" />
    );
  }

  // Format currency tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any, name: any): [any, any] => {
    if (name === "spent") {
      return [`Rs. ${Number(value).toLocaleString()}`, "Amount Spent"];
    }
    return [value, "Orders Count"];
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f3aa9b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f3aa9b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece8" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            dy={10}
            style={{
              fontSize: "12px",
              fontFamily: "Poppins, sans-serif",
              fill: "#888888",
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            dx={-10}
            style={{
              fontSize: "12px",
              fontFamily: "Poppins, sans-serif",
              fill: "#888888",
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #f0ece8",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
              fontFamily: "Poppins, sans-serif",
              fontSize: "13px",
            }}
            formatter={formatTooltip}
          />
          <Area
            type="monotone"
            dataKey="spent"
            stroke="#f3aa9b"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSpent)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
