"use client";

import { useId } from "react";

// Base Components → Sliders, pulled from the Figma design system ("gfgfg"
// in the Figma MCP), node 1086:534 (Label=False/Bottom/Top floating, Left
// control/Right control=0–100%). Figma specs a dual-handle *range* slider
// (independent left + right control handles) — only a single-value slider
// is implemented here, built on a native <input type="range"> so keyboard
// control, focus handling, and screen-reader semantics come for free
// instead of being rebuilt for custom drag handles. This app has no
// dual-range filter UI; a single value covers every foreseeable use. The
// "Top floating" value-follows-thumb label is also skipped in favor of the
// simpler, always-visible "Bottom" label style. Track = bg-gray-200 filled
// with bg-brand-600 up to the current value; thumb = white circle,
// 2px brand-600 border, shadow-md, matching the Figma "_Control handle".
export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: boolean;
  disabled?: boolean;
  className?: string;
}

const THUMB =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer";

export default function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label = false,
  disabled,
  className,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={className}>
      <input
        id={id}
        type="range"
        role="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-50 ${THUMB}`}
        style={{
          background: `linear-gradient(to right, #ba24d5 ${pct}%, #e9eaeb ${pct}%)`,
        }}
      />
      {label && (
        <span className="mt-2 block font-body text-md font-medium text-gray-900">{value}</span>
      )}
    </div>
  );
}
