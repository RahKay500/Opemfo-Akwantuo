"use client";

import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export interface MonthlyReferralsPoint {
  month: string;
  received: number;
  seen: number;
}

export default function MonthlyReferralsChart({ data }: { data: MonthlyReferralsPoint[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="receivedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AB49D5" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#AB49D5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDD5F9" vertical={true} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#EDD5F9" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#EDD5F9", fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
          <Area
            type="monotone"
            dataKey="received"
            stroke="#AB49D5"
            strokeWidth={2.5}
            fill="url(#receivedFill)"
            name="Received"
          />
          <Line
            type="monotone"
            dataKey="seen"
            stroke="#D12371"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name="Seen"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
