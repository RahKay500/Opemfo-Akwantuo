import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

// "positive"/"info" describe a reading's status (e.g. BP in normal range,
// an appointment confirmed) — a different concept from clinical triage
// priority, so these don't reuse the critical/high/medium/low tokens.
const BADGE_TONES = {
  positive: "bg-[#F0FDF4] text-[#16A34A]",
  info: "bg-lilac-light text-lilac-deeper",
};

interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  label: string;
  value: string;
  badge?: { text: string; tone: keyof typeof BADGE_TONES };
}

export default function StatCard({ icon: Icon, iconClassName, label, value, badge }: StatCardProps) {
  return (
    <div className="flex-1 rounded-card bg-white p-3.5 shadow-card">
      <Icon className={cn("size-4", iconClassName)} />
      <p className="mt-1.5 font-body text-[11px] font-medium text-text-secondary">{label}</p>
      <p className="mt-0.5 font-heading text-lg font-bold text-text-primary">{value}</p>
      {badge && (
        <span
          className={cn(
            "mt-1.5 inline-block rounded-badge px-2 py-0.5 font-body text-[10px] font-medium",
            BADGE_TONES[badge.tone]
          )}
        >
          {badge.text}
        </span>
      )}
    </div>
  );
}
