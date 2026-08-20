"use client";

import { cn } from "@/lib/utils";
import type { ExamArea } from "@/lib/mch-record";

// One row of Physical Examination at First Visit — a body area, a
// Normal/Abnormal toggle, and (only when Abnormal) a note field, matching
// the paper record book's "Normal / Abnormal: ____" line per area.
export default function ExamRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ExamArea;
  onChange: (value: ExamArea) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border-color py-2.5 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-[14px] text-text-primary">{label}</p>
        <div className="flex shrink-0 gap-1 rounded-input border-[1.5px] border-border-color bg-white p-1">
          <button
            type="button"
            onClick={() => onChange({ ...value, normal: true })}
            className={cn(
              "h-8 rounded-badge px-3 font-body text-xs font-medium",
              value.normal ? "bg-lilac-mid text-lilac-deeper" : "text-text-secondary"
            )}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, normal: false })}
            className={cn(
              "h-8 rounded-badge px-3 font-body text-xs font-medium",
              !value.normal ? "bg-critical-bg text-critical" : "text-text-secondary"
            )}
          >
            Abnormal
          </button>
        </div>
      </div>
      {!value.normal && (
        <input
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          placeholder="Describe finding"
          className="h-10 w-full rounded-input border-[1.5px] border-border-color bg-white px-3 font-body text-sm text-text-primary outline-none focus:border-primary"
        />
      )}
    </div>
  );
}
