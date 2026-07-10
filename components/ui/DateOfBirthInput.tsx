"use client";

import { useRef, useState, useEffect } from "react";

// Native <input type="date"> opens a wheel/calendar picker that defaults to
// today — for a date of birth decades in the past, that means scrolling
// through dozens of months every time, which is what made registration feel
// slow. Three typed digit fields (day/month/year) let a midwife enter a
// known birthdate in a few keystrokes instead.
export default function DateOfBirthInput({
  value,
  onChange,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
  max?: string;
}) {
  const [year, month, day] = value ? value.split("-") : ["", "", ""];
  const [d, setD] = useState(day ?? "");
  const [m, setM] = useState(month ?? "");
  const [y, setY] = useState(year ?? "");

  const dRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const [y2, m2, d2] = value ? value.split("-") : ["", "", ""];
    setD(d2 ?? "");
    setM(m2 ?? "");
    setY(y2 ?? "");
  }, [value]);

  function emit(nextD: string, nextM: string, nextY: string) {
    if (nextD.length !== 2 || nextM.length !== 2 || nextY.length !== 4) {
      onChange("");
      return;
    }
    const iso = `${nextY}-${nextM}-${nextD}`;
    if (max && iso > max) {
      onChange("");
      return;
    }
    onChange(iso);
  }

  function handleDay(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setD(digits);
    emit(digits, m, y);
    if (digits.length === 2) mRef.current?.focus();
  }

  function handleMonth(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setM(digits);
    emit(d, digits, y);
    if (digits.length === 2) yRef.current?.focus();
  }

  function handleYear(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setY(digits);
    emit(d, m, digits);
  }

  return (
    <div className="flex gap-2.5" role="group" aria-label="Date of birth">
      <input
        ref={dRef}
        inputMode="numeric"
        placeholder="DD"
        value={d}
        onChange={(e) => handleDay(e.target.value)}
        className="h-14 w-16 rounded-input border-[1.5px] border-border-color bg-white text-center font-body text-[15px] text-text-primary outline-none focus:border-primary"
      />
      <input
        ref={mRef}
        inputMode="numeric"
        placeholder="MM"
        value={m}
        onChange={(e) => handleMonth(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && m === "") dRef.current?.focus();
        }}
        className="h-14 w-16 rounded-input border-[1.5px] border-border-color bg-white text-center font-body text-[15px] text-text-primary outline-none focus:border-primary"
      />
      <input
        ref={yRef}
        inputMode="numeric"
        placeholder="YYYY"
        value={y}
        onChange={(e) => handleYear(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && y === "") mRef.current?.focus();
        }}
        className="h-14 flex-1 rounded-input border-[1.5px] border-border-color bg-white px-3 text-center font-body text-[15px] text-text-primary outline-none focus:border-primary"
      />
    </div>
  );
}
