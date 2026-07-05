import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const GHANA_PHONE_REGEX = /^\+233[0-9]{9}$/;

export function isValidGhanaPhone(phone: string): boolean {
  return GHANA_PHONE_REGEX.test(phone);
}

// Figma inputs collect the local "024 123 4567" format; the API expects
// "+233241234567". Accepts either and returns null if it can't be normalized.
export function normalizeGhanaPhone(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "");
  if (/^\+233[0-9]{9}$/.test(digits)) return digits;
  if (/^0[0-9]{9}$/.test(digits)) return `+233${digits.slice(1)}`;
  if (/^233[0-9]{9}$/.test(digits)) return `+${digits}`;
  return null;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

// iOS/Android contact autofill can hand back a saved contact name with an
// emoji the person added for their own organization (e.g. a hospital emoji
// before their name) -- strips it so it doesn't end up in clinical records.
// Also strips zero-width joiner (U+200D) and the emoji variation selector
// (U+FE0F), which glue/style compound emoji and would otherwise leave stray
// marks behind once the base emoji character is removed.
const EMOJI_PATTERN = /[\p{Extended_Pictographic}\u200D\uFE0F]/gu;

export function stripEmoji(text: string): string {
  return text.replace(EMOJI_PATTERN, "").replace(/\s+/g, " ").trimStart();
}
