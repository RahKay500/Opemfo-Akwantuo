"use client";

import type { ReactNode } from "react";

// Base Components → Button groups, pulled from the Figma design system
// ("gfgfg" in the Figma MCP), nodes 1046:10170 (group shell) and
// 1241:125606 (segment, Current=True/False). A segmented control: each
// segment shares one border and the whole group shares one radius/shadow,
// with the active segment picked out by a slightly darker fill and text.
export interface ButtonGroupOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface ButtonGroupProps<T extends string> {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function ButtonGroup<T extends string>({ options, value, onChange, className }: ButtonGroupProps<T>) {
  return (
    <div className={`isolate flex overflow-hidden rounded-md border border-border-color shadow-xs ${className ?? ""}`}>
      {options.map((option, i) => {
        const current = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 font-heading text-sm font-semibold transition-colors ${
              i > 0 ? "border-l border-border-color" : ""
            } ${current ? "bg-gray-50 text-gray-800" : "bg-white text-text-secondary hover:bg-gray-50"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
