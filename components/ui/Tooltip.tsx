"use client";

import type { ReactNode } from "react";

// Base Components → Tooltips, pulled from the Figma design system ("gfgfg"
// in the Figma MCP), node 1052 (Arrow=Top/Bottom/Left/Right center, Text=
// single line or with supporting text). Dark bubble (bg-primary-solid),
// radius-md, shadow-lg, text-xs semibold white, centered; a small rotated
// square stands in for Figma's arrow SVG. Only the 4 cardinal "center"
// placements are implemented — the corner-offset arrow variants
// (bottom-left/bottom-right) aren't, since every tooltip usage in this app
// is on a small icon-button/badge where a centered arrow reads fine.
export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  text: string;
  supportingText?: string;
  side?: TooltipSide;
  children: ReactNode;
}

const BUBBLE_POSITION: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

const ARROW_POSITION: Record<TooltipSide, string> = {
  top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "left-full top-1/2 -translate-y-1/2 -translate-x-1/2",
  right: "right-full top-1/2 -translate-y-1/2 translate-x-1/2",
};

export default function Tooltip({ text, supportingText, side = "top", children }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-max max-w-[296px] rounded-md bg-[#0A0D12] px-3 py-2 opacity-0 shadow-lg transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${
          BUBBLE_POSITION[side]
        } ${supportingText ? "flex flex-col gap-0.5 p-3 text-left" : "text-center"}`}
      >
        <span className="font-body text-xs font-semibold text-white">{text}</span>
        {supportingText && <span className="font-body text-xs font-medium text-gray-300">{supportingText}</span>}
        <span className={`absolute size-1.5 rotate-45 bg-[#0A0D12] ${ARROW_POSITION[side]}`} />
      </span>
    </span>
  );
}
