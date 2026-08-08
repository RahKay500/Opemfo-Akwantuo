import type { SelectHTMLAttributes } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

// Base Components → Dropdowns, "Select" trigger field, pulled from the
// Figma design system ("gfgfg" in the Figma MCP), node 3281:377673 (Size=
// sm/md, Type=Default, State=Default/Placeholder). Wraps a native <select>
// rather than building a custom listbox/combobox — the Figma component's
// open-state dropdown panel and its list-item variants (icon/avatar/dot
// leading, search, tags) aren't implemented, since a native select already
// gives correct keyboard/accessibility behavior for the plain-option case
// every existing usage in this app needs. Label/required/hint/error text
// aren't part of this component — the app already has FormField for that,
// used the same way around this as it was around the old raw <select>s.
export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: SelectSize;
}

// "lg" matches this app's mobile-first 56px touch-target convention
// (h-14 / rounded-input / border-[1.5px] / font-normal) rather than Figma's
// own sizing — see the app's hand-rolled form selects this size replaces.
const SIZE_STYLES: Record<SelectSize, string> = {
  sm: "h-10 rounded-md border px-3 text-sm shadow-xs font-medium",
  md: "h-11 rounded-md border px-3.5 text-base shadow-xs font-medium",
  lg: "h-14 rounded-input border-[1.5px] px-[17.5px] text-[15px] font-normal",
};

export default function Select({ selectSize = "sm", className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none border-border-color bg-white pr-9 font-body text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
          SIZE_STYLES[selectSize]
        } ${className ?? ""}`}
        {...props}
      >
        {children}
      </select>
      <ChevronRightIcon className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 rotate-90 text-gray-500" />
    </div>
  );
}
