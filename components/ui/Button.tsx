"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// Base Components → Buttons, first item pulled from the Figma design
// system ("gfgfg" in the Figma MCP), node 3287:427074. Specs taken from
// the Primary/Secondary/Tertiary/Link color/Link gray hierarchy variants
// at Default + Disabled state, across all four sizes. Brand color swapped
// to this app's fuchsia (matching the earlier Foundations decision), not
// the kit's demo green.
//
// This is a new shared primitive — the app currently hand-styles every
// button inline rather than through a component, so nothing else has been
// swapped over to use this yet. That's a separate, larger follow-up once
// this primitive is confirmed correct.
export type ButtonHierarchy = "primary" | "secondary" | "tertiary" | "link-color" | "link-gray";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hierarchy?: ButtonHierarchy;
  size?: ButtonSize;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
}

// Vertical padding is 10px for every size except sm (8px); only the text
// size, horizontal padding, and icon gap grow — this is a Figma-verified
// pattern (line-height + 2×10px = the size's total height for md/lg/xl).
const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "gap-1 px-3 py-2 text-sm",
  md: "gap-1 px-3.5 py-2.5 text-sm",
  lg: "gap-1.5 px-4 py-2.5 text-base",
  xl: "gap-2 px-[18px] py-2.5 text-lg",
};

// Link hierarchies carry no padding/radius/background — inline text only.
const HIERARCHY_STYLES: Record<ButtonHierarchy, string> = {
  primary: "rounded-full bg-primary text-white disabled:bg-gray-100 disabled:text-gray-400",
  secondary:
    "rounded-full border border-border-color bg-white text-text-secondary disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
  tertiary: "rounded-md text-gray-600 disabled:text-gray-400",
  "link-color": "text-brand-700 disabled:text-gray-400",
  "link-gray": "text-gray-600 disabled:text-gray-400",
};

export default function Button({
  hierarchy = "primary",
  size = "md",
  iconLeading,
  iconTrailing,
  className,
  children,
  ...props
}: ButtonProps) {
  const isLink = hierarchy === "link-color" || hierarchy === "link-gray";
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center whitespace-nowrap font-heading font-semibold transition-colors disabled:cursor-not-allowed ${
        isLink ? "gap-1" : SIZE_STYLES[size]
      } ${HIERARCHY_STYLES[hierarchy]} ${className ?? ""}`}
      {...props}
    >
      {iconLeading}
      {children}
      {iconTrailing}
    </button>
  );
}
