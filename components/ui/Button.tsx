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
export type ButtonHierarchy = "primary" | "secondary" | "tertiary" | "link-color" | "link-gray" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "cta" | "admin-sm";
export type ButtonShape = "pill" | "rect" | "card";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hierarchy?: ButtonHierarchy;
  size?: ButtonSize;
  shape?: ButtonShape;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
}

// Vertical padding is 10px for every size except sm (8px); only the text
// size, horizontal padding, and icon gap grow — this is a Figma-verified
// pattern (line-height + 2×10px = the size's total height for md/lg/xl).
// "cta" matches this app's mobile-first full-width primary action button
// convention (h-14, 17px bold text) rather than Figma's own padding-driven
// sizing — see the app's hand-rolled CTA buttons this size replaces.
const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "gap-1 px-3 py-2 text-sm font-semibold",
  md: "gap-1 px-3.5 py-2.5 text-sm font-semibold",
  lg: "gap-1.5 px-4 py-2.5 text-base font-semibold",
  xl: "gap-2 px-[18px] py-2.5 text-lg font-semibold",
  cta: "h-14 w-full gap-1.5 text-[17px] font-bold",
  // Matches Admin's own hand-rolled danger-button padding/text exactly.
  "admin-sm": "px-4 py-2 text-sm font-semibold",
};

// "pill" (rounded-full) is this primitive's native Figma shape. "rect"
// (rounded-button, 14px) and "card" (rounded-card, 20px) are this app's own
// two competing full-width CTA radii — both appear across real screens, so
// both are exposed rather than silently unifying them. Only
// primary/secondary use a shape — tertiary keeps its own fixed rounded-md,
// and links carry no radius at all.
const RADIUS: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rect: "rounded-button",
  card: "rounded-card",
};
const SHAPED_HIERARCHIES = new Set<ButtonHierarchy>(["primary", "secondary", "soft"]);

// Link hierarchies carry no padding/radius/background — inline text only.
// "soft" (bg-lilac-mid/text-lilac-deeper) isn't part of the Figma kit — it's
// this app's own established secondary-action button treatment, used
// consistently across Midwife/Doctor forms alongside "primary".
const HIERARCHY_STYLES: Record<ButtonHierarchy, string> = {
  primary: "bg-primary text-white disabled:bg-gray-100 disabled:text-gray-400",
  secondary:
    "border border-border-color bg-white text-text-secondary disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
  tertiary: "rounded-md text-gray-600 disabled:text-gray-400",
  "link-color": "text-brand-700 disabled:text-gray-400",
  "link-gray": "text-gray-600 disabled:text-gray-400",
  soft: "bg-lilac-mid text-lilac-deeper disabled:opacity-60",
  // Admin's own hand-rolled destructive-action button (Facility/Staff/
  // Facility-Admin delete confirmations, Audit Log clear-all) — raw hex,
  // not a design-system color, and rounded-md rather than a shape variant
  // since Admin doesn't use this app's rounded-button/rounded-card scale.
  danger: "rounded-md bg-[#DC2626] text-white disabled:opacity-60",
};

export default function Button({
  hierarchy = "primary",
  size = "md",
  shape = "pill",
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
      className={`inline-flex items-center justify-center whitespace-nowrap font-heading transition-colors disabled:cursor-not-allowed ${
        isLink ? "gap-1" : SIZE_STYLES[size]
      } ${SHAPED_HIERARCHIES.has(hierarchy) ? RADIUS[shape] : ""} ${HIERARCHY_STYLES[hierarchy]} ${className ?? ""}`}
      {...props}
    >
      {iconLeading}
      {children}
      {iconTrailing}
    </button>
  );
}
