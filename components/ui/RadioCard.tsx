"use client";

import type { ReactNode } from "react";
import Radio from "@/components/ui/Radio";

// Base Components → Radio groups, "Radio group item" (Type=Radio button),
// pulled from the Figma design system ("gfgfg" in the Figma MCP), node
// 124:2838 (Selected=True/False, Size=md, State=Default). A selectable
// option card: unselected = border-gray-200, rounded-xl; selected =
// 2px border-primary (our brand). Radio control top-aligned with the
// title/description text. "Icon simple/Icon card/Avatar/Payment icon"
// item types aren't implemented — this app's option-card usages (e.g.
// Book a Visit) are plain title+description, matching "Radio button" type.
export interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  subtext?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function RadioCard({ selected, onSelect, title, subtext, description, disabled, className }: RadioCardProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-xl bg-white p-4 text-left ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${selected ? "border-2 border-primary" : "border border-gray-200"} ${className ?? ""}`}
    >
      <div className="flex shrink-0 items-center justify-center pt-0.5">
        <Radio checked={selected} onChange={onSelect} size="md" disabled={disabled} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 font-body text-base">
        <div className="flex items-start gap-1.5 whitespace-nowrap">
          <p className="font-medium text-text-secondary">{title}</p>
          {subtext && <p className="text-gray-600">{subtext}</p>}
        </div>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
    </div>
  );
}
