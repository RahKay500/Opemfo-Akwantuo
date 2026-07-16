"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { THRESHOLDS } from "@/lib/flagging";

export interface BPGraphPoint {
  visit: string;
  systolic: number;
  diastolic: number;
}

export default function BPGraph({
  data,
  showThreshold = true,
  systolicColor = "#DB2777",
  diastolicColor = "#C178E0",
}: {
  data: BPGraphPoint[];
  showThreshold?: boolean;
  systolicColor?: string;
  diastolicColor?: string;
}) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="visit"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#EDD5F9" }}
            tickLine={false}
          />
          <YAxis
            domain={[60, 180]}
            ticks={[60, 90, 120, 150, 180]}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#EDD5F9", fontSize: 12 }}
            labelStyle={{ fontWeight: 600 }}
          />
          {showThreshold && (
            <ReferenceLine
              y={THRESHOLDS.systolic.high}
              stroke="#DC2626"
              strokeDasharray="4 4"
              label={{ value: "Hypertension threshold", position: "insideTopLeft", fontSize: 10, fill: "#DC2626" }}
            />
          )}
          <Line type="monotone" dataKey="systolic" stroke={systolicColor} strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
          <Line type="monotone" dataKey="diastolic" stroke={diastolicColor} strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
