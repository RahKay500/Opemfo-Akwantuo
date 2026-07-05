"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export default function OTPInput({ length = 6, value, onChange, autoFocus }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(length, "").slice(0, length).replace(/ /g, ""));
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="flex w-full gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            // min-w-0 is required: flex items (especially <input>, a replaced
            // element) default to min-width:auto, so flex-1 alone can't
            // shrink them below their intrinsic ~200px browser default width.
            "h-16 min-w-0 flex-1 rounded-input border-[1.5px] border-border-color bg-white text-center font-heading text-xl font-bold text-text-primary outline-none",
            "focus:border-2 focus:border-primary focus:bg-lilac-light",
            digit && "border-2 border-primary bg-lilac-light"
          )}
        />
      ))}
    </div>
  );
}
