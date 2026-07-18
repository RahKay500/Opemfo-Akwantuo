"use client";

import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export interface PatientGrowthPoint {
  label: string;
  count: number;
}

export default function PatientGrowthChart({ data }: { data: PatientGrowthPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="patientGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
          <Area type="monotone" dataKey="count" stroke="none" fill="url(#patientGrowthFill)" />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#7C3AED"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#7C3AED", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Patients"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
