"use client";

// Base Components → Toggles, "Toggle" (Type=Default), pulled from the
// Figma design system ("gfgfg" in the Figma MCP), node 1102:4631 (Pressed=
// True/False, Size=sm/md, State=Default). Off = bg-gray-100 track, white
// thumb with shadow-sm; on = bg-primary (our brand) track, thumb slides to
// the end. "Type=Slim" (a thinner track variant) and the Text=True variant
// (label baked into the toggle component itself) aren't implemented — this
// app already pairs toggles with its own label markup where needed (see
// PreferencesCard).
export type ToggleSize = "sm" | "md";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: ToggleSize;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const TRACK_SIZE: Record<ToggleSize, string> = {
  sm: "h-5 w-9",
  md: "h-6 w-11",
};

const THUMB_SIZE: Record<ToggleSize, string> = {
  sm: "size-4",
  md: "size-5",
};

export default function Toggle({ checked, onChange, size = "sm", disabled, className, ...aria }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary justify-end" : "bg-gray-100 justify-start"
      } ${TRACK_SIZE[size]} ${className ?? ""}`}
      {...aria}
    >
      <span className={`rounded-full bg-white shadow-sm transition-transform ${THUMB_SIZE[size]}`} />
    </button>
  );
}
