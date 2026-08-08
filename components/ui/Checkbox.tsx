"use client";

import { CheckIcon } from "@/components/ui/icons";

// Base Components → Checkboxes, "Checkbox" type, pulled from the Figma
// design system ("gfgfg" in the Figma MCP), node 1097:63638 (Checked=True/
// False, Size=sm/md, State=Default). Unchecked = border-primary box,
// radius-xs (sm, 16px) or radius-sm (md, 20px); checked = bg-primary (our
// brand) with a white checkmark, same radius/size. Indeterminate isn't
// implemented — no multi-select-with-partial-selection UI in this app yet.
export type CheckboxSize = "sm" | "md";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: CheckboxSize;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const SIZE_STYLES: Record<CheckboxSize, string> = {
  sm: "size-4 rounded-xs",
  md: "size-5 rounded-sm",
};

export default function Checkbox({ checked, onChange, size = "sm", disabled, className, ...aria }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex shrink-0 items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "border-primary bg-primary" : "border-border-color bg-white"
      } ${SIZE_STYLES[size]} ${className ?? ""}`}
      {...aria}
    >
      {checked && <CheckIcon className="size-full p-[15%] text-white" />}
    </button>
  );
}
