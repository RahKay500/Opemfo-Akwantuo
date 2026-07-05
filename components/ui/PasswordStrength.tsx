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

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = scorePassword(password);

  return (
    <div className="flex w-full gap-1 pt-2.5" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={cn("h-1 flex-1 rounded-badge", i < score ? "bg-lilac-dark" : "bg-border-color")}
        />
      ))}
    </div>
  );
}
