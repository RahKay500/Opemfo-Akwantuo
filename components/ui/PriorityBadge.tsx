import type { Priority } from "@prisma/client";
import { cn } from "@/lib/utils";

const STYLES: Record<Priority, string> = {
  CRITICAL: "bg-critical-bg text-critical",
  HIGH: "bg-high-bg text-high",
  MEDIUM: "bg-medium-bg text-medium",
  LOW: "bg-low-bg text-low",
};

const LABELS: Record<Priority, string> = {
  CRITICAL: "Critical Priority",
  HIGH: "High Priority",
  MEDIUM: "Medium Priority",
  LOW: "Low Priority",
};

export default function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-badge px-3.5 py-1.5 font-body text-[13px] font-medium",
        STYLES[priority],
        className
      )}
    >
      {LABELS[priority]}
    </span>
  );
}
