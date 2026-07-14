"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";

export interface PatientsWeekPoint {
  day: string;
  count: number;
}

export default function PatientsWeekChart({ data }: { data: PatientsWeekPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#EDD5F9" }}
            tickLine={false}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.count === max ? "#AB49D5" : "#EDD5F9"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
