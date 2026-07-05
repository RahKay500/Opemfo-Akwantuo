import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
  return score;
}

// Index = score (0-4). Uses brand tokens, not triage colors — this isn't a
// clinical priority indicator, and those are reserved for that.
const LEVELS = [
  { label: "Very weak", className: "text-pink-deep" },
  { label: "Weak", className: "text-pink-deep" },
  { label: "Fair", className: "text-text-secondary" },
  { label: "Good", className: "text-lilac-dark" },
  { label: "Strong", className: "text-lilac-deeper" },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="pt-2.5">
      <div className="flex w-full gap-1" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-badge", i < score ? "bg-lilac-dark" : "bg-border-color")}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={cn("mt-1 font-body text-xs font-medium", level.className)}>{level.label}</p>
      )}
    </div>
  );
}
