"use client";

import type { ChangeEvent } from "react";
import Input, { type InputSize } from "@/components/ui/Input";

// Ghana Card (NIA) ID format: GHA-XXXXXXXXX-X — 9 digits, then a single
// check digit. The GHA- prefix and dash are fixed by the government
// format, so the user only ever types the 10 digits; this formats them
// into shape as they go instead of asking for the punctuation too.
function formatGhanaCard(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length > 9) return `GHA-${d.slice(0, 9)}-${d.slice(9)}`;
  return `GHA-${d}`;
}

export default function GhanaCardInput({
  value,
  onChange,
  inputSize = "lg",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  inputSize?: InputSize;
  className?: string;
}) {
  const digits = value.replace(/^GHA-?/, "").replace(/\D/g, "").slice(0, 10);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newDigits = e.target.value.replace(/^GHA-?/, "").replace(/\D/g, "").slice(0, 10);
    onChange(newDigits.length === 0 ? "" : formatGhanaCard(newDigits));
  }

  return (
    <Input
      inputSize={inputSize}
      value={formatGhanaCard(digits)}
      onChange={handleChange}
      placeholder="GHA-XXXXXXXXX-X"
      inputMode="numeric"
      className={className}
    />
  );
}
