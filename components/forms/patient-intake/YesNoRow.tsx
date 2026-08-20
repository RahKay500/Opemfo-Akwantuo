"use client";

import { cn } from "@/lib/utils";

// One row of the Medical/Social/Family History checklists — a label, a
// No/Yes toggle, and (only when Yes, and only if the row takes one) an
// inline "specify" text field, matching how the paper record book pairs
// a Yes circle with a blank line for detail (e.g. Allergies, Medication).
export default function YesNoRow({
  label,
  checked,
  onChange,
  detail,
  onDetailChange,
  detailPlaceholder = "Specify",
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  detail?: string;
  onDetailChange?: (value: string) => void;
  detailPlaceholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border-color py-2.5 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-[14px] text-text-primary">{label}</p>
        <div className="flex shrink-0 gap-1 rounded-input border-[1.5px] border-border-color bg-white p-1">
          <button
            type="button"
            onClick={() => onChange(false)}
            className={cn(
              "h-8 w-14 rounded-badge font-body text-xs font-medium",
              !checked ? "bg-lilac-mid text-lilac-deeper" : "text-text-secondary"
            )}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onChange(true)}
            className={cn(
              "h-8 w-14 rounded-badge font-body text-xs font-medium",
              checked ? "bg-lilac-mid text-lilac-deeper" : "text-text-secondary"
            )}
          >
            Yes
          </button>
        </div>
      </div>
      {checked && onDetailChange && (
        <input
          value={detail ?? ""}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder={detailPlaceholder}
          className="h-10 w-full rounded-input border-[1.5px] border-border-color bg-white px-3 font-body text-sm text-text-primary outline-none focus:border-primary"
        />
      )}
    </div>
  );
}
