import type { ReactNode } from "react";

// Base Components → Badges, pulled from the Figma design system ("gfgfg"
// in the Figma MCP), node 1046:3819. Every color follows the same
// bg-{color}-50 / border-{color}-200 / text-{color}-700 formula (verified
// against Gray and Brand) — "Brand" here is our fuchsia token, not the
// kit's demo green. "pill" = Type=Pill color (radius-full, px-2), "rounded"
// = Type=Badge color (radius-sm, px-1.5); both share size=sm's bg/border/
// text spec, which is what's been verified against Figma. "Badge modern"
// (a left-accent-bar variant) isn't implemented here.
export type BadgeColor =
  | "gray"
  | "brand"
  | "error"
  | "warning"
  | "success"
  | "blue"
  | "purple"
  | "pink"
  | "yellow";
export type BadgeType = "pill" | "rounded";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  type?: BadgeType;
  size?: BadgeSize;
  // This app's own status pills (Midwife/Doctor patient status, priority)
  // are borderless — a real, systemic difference from this primitive's own
  // Figma-verified bordered pill. Default true preserves the primitive's
  // native look; set false to match that app convention.
  border?: boolean;
  className?: string;
}

const COLOR_STYLES: Record<BadgeColor, string> = {
  gray: "bg-gray-50 border-gray-200 text-gray-700",
  brand: "bg-brand-50 border-brand-200 text-brand-700",
  error: "bg-error-50 border-error-200 text-error-700",
  warning: "bg-warning-50 border-warning-200 text-warning-700",
  success: "bg-success-50 border-success-100 text-success-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  pink: "bg-pink-50 border-pink-200 text-pink-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

// Padding scales up with size; text stays xs across all three per Figma.
const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5",
  md: "px-2.5 py-0.5",
  lg: "px-3 py-1",
};

export default function Badge({
  children,
  color = "gray",
  type = "pill",
  size = "sm",
  border = true,
  className,
}: BadgeProps) {
  const colorStyles = border ? COLOR_STYLES[color] : COLOR_STYLES[color].replace(/\bborder-\S+/, "");
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-body text-xs font-medium ${
        border ? "border" : ""
      } ${type === "pill" ? "rounded-full" : "rounded-sm"} ${colorStyles} ${SIZE_STYLES[size]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
