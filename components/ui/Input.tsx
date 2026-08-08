import type { InputHTMLAttributes, ReactNode } from "react";

// Base Components → Inputs, "Input field" (Type=Default), pulled from the
// Figma design system ("gfgfg" in the Figma MCP), node 1090:57817 (Size=
// sm/md, State=Placeholder/Focused/Disabled/Destructive). White bg,
// border-primary at rest, 2px border-primary (our brand) when focused,
// radius-md, text-base regular. Label/required/hint/error text aren't
// part of this component — the app already has FormField for that.
// Payment/Tags/Leading-dropdown/Trailing-button/Mega/Verification-code
// input types aren't implemented — none are needed by this app's forms.
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  destructive?: boolean;
  iconLeading?: ReactNode;
}

// "lg" matches this app's mobile-first 56px touch-target convention
// (h-14 / rounded-input / border-[1.5px]) rather than Figma's own sizing —
// see the app's hand-rolled form inputs this size replaces.
const SIZE_STYLES: Record<InputSize, string> = {
  sm: "h-10 rounded-md border px-3 text-sm shadow-xs focus-within:border-2",
  md: "h-11 rounded-md border px-3.5 text-base shadow-xs focus-within:border-2",
  lg: "h-14 rounded-input border-[1.5px] px-[17.5px] text-[15px]",
};

export default function Input({ inputSize = "sm", destructive = false, iconLeading, className, ...props }: InputProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-white ${
        destructive ? "border-error-500 focus-within:border-error-500" : "border-border-color focus-within:border-primary"
      } ${SIZE_STYLES[inputSize]} ${className ?? ""}`}
    >
      {iconLeading}
      <input
        className="w-full min-w-0 bg-transparent font-body text-inherit text-text-primary outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:text-gray-500"
        {...props}
      />
    </div>
  );
}
