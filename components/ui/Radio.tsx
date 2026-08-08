"use client";

// Base Components → Checkboxes, "Radio" type, pulled from the Figma
// design system ("gfgfg" in the Figma MCP), node 1097:63638 (Checked=True/
// False, Size=sm/md, State=Default). Unchecked = border-primary circle;
// checked = bg-primary (our brand) circle with a white inner dot.
export type RadioSize = "sm" | "md";

export interface RadioProps {
  checked: boolean;
  onChange: () => void;
  size?: RadioSize;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const SIZE_STYLES: Record<RadioSize, string> = {
  sm: "size-4",
  md: "size-5",
};

export default function Radio({ checked, onChange, size = "sm", disabled, className, ...aria }: RadioProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`flex shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "border-primary bg-primary" : "border-border-color bg-white"
      } ${SIZE_STYLES[size]} ${className ?? ""}`}
      {...aria}
    >
      {checked && <span className="m-[30%] flex-1 rounded-full bg-white" />}
    </button>
  );
}
