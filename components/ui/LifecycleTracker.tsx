import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface LifecycleStep {
  label: string;
  timestamp?: string | null;
  state: "done" | "current" | "pending";
}

function Circle({ state }: { state: LifecycleStep["state"] }) {
  if (state === "done") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-badge bg-[#16A34A]">
        <CheckIcon className="size-3.5 text-white" />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="relative flex size-7 shrink-0 items-center justify-center rounded-badge bg-primary ring-4 ring-lilac-light">
        <span className="size-2.5 rounded-badge bg-white" />
      </div>
    );
  }
  return <div className="size-7 shrink-0 rounded-badge border-2 border-border-color bg-white" />;
}

export default function LifecycleTracker({ steps }: { steps: LifecycleStep[] }) {
  return (
    <>
      {/* Mobile: vertical timeline, dot + connecting line on the left, label to the right. */}
      <div className="flex flex-col lg:hidden">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <Circle state={step.state} />
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

      {/* Desktop: horizontal timeline, dots connected left-to-right, labels centered below each dot. */}
      <div className="hidden lg:block">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <Circle state={step.state} />
              {index < steps.length - 1 && (
                <div className={cn("h-0.5 flex-1", step.state === "done" ? "bg-[#16A34A]" : "bg-border-color")} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {steps.map((step) => (
            <div key={step.label} className="text-center">
              <p
                className={cn(
                  "font-heading text-sm font-bold",
                  step.state === "pending" ? "text-[#9CA3AF]" : "text-text-primary"
                )}
              >
                {step.label}
              </p>
              {step.timestamp && <p className="mt-0.5 font-body text-xs text-text-secondary">{step.timestamp}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
