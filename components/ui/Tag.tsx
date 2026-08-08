"use client";

import { XIcon } from "@/components/ui/icons";

// Base Components → Tags, pulled from the Figma design system ("gfgfg" in
// the Figma MCP), node 3307:417515. Covers the sm size fully verified
// against Figma (Text only / X close / Count actions); md/lg scale padding
// proportionally since text stays xs at every size per Figma. "Icon=Dot/
// Country/Avatar" variants aren't implemented — this app has no use for a
// country-flag or avatar-in-tag pattern.
export type TagSize = "sm" | "md" | "lg";

export interface TagProps {
  children: string;
  size?: TagSize;
  count?: number;
  onRemove?: () => void;
  className?: string;
}

const SIZE_STYLES: Record<TagSize, string> = {
  sm: "py-[3px]",
  md: "py-1",
  lg: "py-1.5",
};

export default function Tag({ children, size = "sm", count, onRemove, className }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border border-border-color bg-white font-body text-xs font-medium text-text-secondary ${
        SIZE_STYLES[size]
      } ${onRemove ? "pl-2 pr-1" : count !== undefined ? "pl-2 pr-1" : "px-2"} ${className ?? ""}`}
    >
      {children}
      {count !== undefined && (
        <span className="rounded-[3px] bg-gray-100 px-1 text-center text-xs font-medium text-text-secondary">
          {count}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex shrink-0 items-center justify-center rounded-[3px] p-0.5 hover:bg-gray-100"
          aria-label="Remove"
        >
          <XIcon className="size-2.5 text-gray-500" />
        </button>
      )}
    </span>
  );
}
