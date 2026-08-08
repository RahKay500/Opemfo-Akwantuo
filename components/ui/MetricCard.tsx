"use client";

import type { ReactNode } from "react";
import { ArrowUpRightIcon, DotsVerticalIcon } from "./icons";

// Application Components → Metrics, "Metric item" component, pulled from
// the Figma design system ("gfgfg" in the Figma MCP), node 1560:266217
// (Type=Simple/Icon 01-04/Chart 01-04, Actions=True/False). Only "Simple"
// is implemented — label + big display number + optional trend "Change"
// pill (up/down %) + optional "..." dropdown + optional footer action
// link. The Icon variants (a large decorative icon beside the number)
// and Chart variants (an inline mini-sparkline behind the number) are
// skipped: this app already renders full trend charts on the screens
// that need them (BPGraph, PatientGrowthChart, etc. — recharts-based),
// so a second, smaller inline-sparkline metric card would duplicate that
// rather than fill a gap. Distinct from the existing app-specific
// `StatCard` (compact, mobile, icon+badge, used across mother/midwife
// screens) — this is the larger desktop-dashboard-style metric card
// Figma specs, with its own trend-pill convention.
export interface MetricCardProps {
  label: string;
  value: string;
  trend?: { direction: "up" | "down"; value: string };
  onMoreClick?: () => void;
  footerAction?: ReactNode;
  className?: string;
}

export default function MetricCard({ label, value, trend, onMoreClick, footerAction, className }: MetricCardProps) {
  return (
    <div className={`relative flex w-full flex-col rounded-xl border border-gray-200 bg-white shadow-xs ${className ?? ""}`}>
      <div className="flex flex-col gap-2 p-5">
        <p className="font-body text-sm font-medium text-gray-600">{label}</p>
        <div className="flex items-end gap-4">
          <p className="flex-1 font-heading text-3xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <span className="flex items-center gap-1 rounded-sm border border-gray-300 py-0.5 pl-1.5 pr-2 shadow-xs">
              <ArrowUpRightIcon className={`size-3 ${trend.direction === "down" ? "rotate-90 text-gray-600" : "text-gray-600"}`} />
              <span className="font-body text-sm font-medium text-gray-700">{trend.value}</span>
            </span>
          )}
        </div>
      </div>
      {footerAction && (
        <div className="flex items-center justify-end border-t border-gray-200 px-5 py-4">{footerAction}</div>
      )}
      {onMoreClick && (
        <button
          type="button"
          onClick={onMoreClick}
          aria-label="More options"
          className="absolute right-[19px] top-[19px] text-gray-500 hover:text-gray-700"
        >
          <DotsVerticalIcon className="size-5" />
        </button>
      )}
    </div>
  );
}
