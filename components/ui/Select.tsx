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
export type SelectSize = "sm" | "md";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: SelectSize;
}

const SIZE_STYLES: Record<SelectSize, string> = {
  sm: "h-10 px-3 text-sm",
  md: "h-11 px-3.5 text-base",
};

export default function Select({ selectSize = "sm", className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none rounded-md border border-border-color bg-white py-2 pr-9 font-body font-medium text-text-primary shadow-xs outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
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
