"use client";

import { useState, useEffect } from "react";

// Day/Month/Year <select> triplet, replacing every native <input type="date">
// in the app. A native date input opens a browser/OS calendar widget that
// behaves inconsistently across devices and — for a date decades in the
// past like a date of birth — defaults to today and forces scrolling back
// year by year. Three plain selects sidestep both problems: no popup, no
// typing, just pick from a bounded list.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type DateSelectSize = "lg" | "sm";

export interface DateSelectInputProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  min?: string; // "YYYY-MM-DD"
  max?: string; // "YYYY-MM-DD"
  size?: DateSelectSize;
  className?: string;
  "aria-label"?: string;
}

const SIZE_STYLES: Record<DateSelectSize, string> = {
  lg: "h-14 rounded-input border-[1.5px] border-border-color bg-white px-2 font-body text-[15px] text-text-primary outline-none focus:border-primary",
  sm: "h-10 rounded-md border border-[#E2E8F0] bg-white px-1.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]",
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function DateSelectInput({
  value,
  onChange,
  min,
  max,
  size = "lg",
  className,
  "aria-label": ariaLabel,
}: DateSelectInputProps) {
  const [y0, m0, d0] = value ? value.split("-") : ["", "", ""];
  // Local state independent of `value` so a partial selection (e.g. only
  // Day picked so far) survives — the parent's value only becomes a real
  // ISO date once all three fields are set, so it can't round-trip
  // in-progress selections on its own.
  const [d, setD] = useState(d0 ?? "");
  const [m, setM] = useState(m0 ?? "");
  const [y, setY] = useState(y0 ?? "");

  useEffect(() => {
    const [y2, m2, d2] = value ? value.split("-") : ["", "", ""];
    setD(d2 ?? "");
    setM(m2 ?? "");
    setY(y2 ?? "");
  }, [value]);

  const now = new Date();
  const maxYear = max ? Number(max.slice(0, 4)) : min ? Number(min.slice(0, 4)) + 10 : now.getFullYear() + 5;
  const minYear = min ? Number(min.slice(0, 4)) : max ? Number(max.slice(0, 4)) - 120 : now.getFullYear() - 120;

  const years: number[] = [];
  for (let yr = maxYear; yr >= minYear; yr--) years.push(yr);

  const numDays = y && m ? daysInMonth(Number(y), Number(m)) : 31;
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  function emit(nextD: string, nextM: string, nextY: string) {
    setD(nextD);
    setM(nextM);
    setY(nextY);
    if (!nextD || !nextM || !nextY) {
      onChange("");
      return;
    }
    const iso = `${nextY}-${nextM}-${nextD}`;
    if (min && iso < min) return;
    if (max && iso > max) return;
    onChange(iso);
  }

  return (
    <div className={`flex gap-2 ${className ?? ""}`} role="group" aria-label={ariaLabel ?? "Date"}>
      <select
        aria-label="Day"
        value={d}
        onChange={(e) => emit(e.target.value, m, y)}
        className={`w-[76px] ${SIZE_STYLES[size]}`}
      >
        <option value="">DD</option>
        {days.map((day) => (
          <option key={day} value={pad(day)}>
            {day}
          </option>
        ))}
      </select>
      <select
        aria-label="Month"
        value={m}
        onChange={(e) => emit(d, e.target.value, y)}
        className={`flex-1 ${SIZE_STYLES[size]}`}
      >
        <option value="">Month</option>
        {MONTHS.map((month, i) => (
          <option key={month} value={pad(i + 1)}>
            {month}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={y}
        onChange={(e) => emit(d, m, e.target.value)}
        className={`w-[92px] ${SIZE_STYLES[size]}`}
      >
        <option value="">YYYY</option>
        {years.map((year) => (
          <option key={year} value={String(year)}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
