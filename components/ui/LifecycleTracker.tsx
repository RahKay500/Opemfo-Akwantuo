import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface LifecycleStep {
  label: string;
  timestamp?: string | null;
  state: "done" | "current" | "pending";
}

export default function LifecycleTracker({ steps }: { steps: LifecycleStep[] }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <div key={step.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              {step.state === "done" && (
                <div className="flex size-7 items-center justify-center rounded-badge bg-[#16A34A]">
                  <CheckIcon className="size-3.5 text-white" />
                </div>
              )}
              {step.state === "current" && (
                <div className="relative flex size-7 items-center justify-center rounded-badge bg-primary ring-4 ring-lilac-light">
                  <span className="size-2.5 rounded-badge bg-white" />
                </div>
              )}
              {step.state === "pending" && (
                <div className="size-7 rounded-badge border-2 border-border-color bg-white" />
              )}
              {!isLast && (
                <div className={cn("w-0.5 flex-1", step.state === "done" ? "bg-[#16A34A]" : "bg-border-color")} />
              )}
            </div>
            <div className={cn("flex flex-col gap-0.5 pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "font-heading text-sm font-bold",
                  step.state === "pending" ? "text-[#9CA3AF]" : "text-text-primary"
                )}
              >
                {step.label}
              </p>
              {step.timestamp && <p className="font-body text-xs text-text-secondary">{step.timestamp}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
