import type { ReactNode } from "react";
import { HelpCircleIcon } from "./icons";

// Application Components → Section headers, "Section label" component,
// pulled from the Figma design system ("gfgfg" in the Figma MCP), node
// 5013:376534 (Size=sm/md, Actions=False/True). The other family on this
// Figma page, "Section header" (large title + Buttons/Button group/Search
// actions + optional Tabs + divider), is skipped as a near-duplicate of
// the already-built PageHeader/CardHeader "Simple" pattern — same title +
// supportingText + actions + divider shape, just without a badge/avatar
// slot. "Section label" is the genuinely distinct piece: a compact,
// field-group-style label (used above a card section or form group) with
// an optional required asterisk, help-icon tooltip trigger, and — at the
// md size — its own small actions row beneath the text.
export interface SectionHeaderProps {
  title: string;
  supportingText?: string;
  required?: boolean;
  helpText?: string;
  size?: "sm" | "md";
  actions?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  supportingText,
  required,
  helpText,
  size = "sm",
  actions,
  className,
}: SectionHeaderProps) {
  const isMd = size === "md";
  return (
    <div className={`flex w-full max-w-[280px] flex-col items-start ${isMd ? "gap-3" : ""} ${className ?? ""}`}>
      <div className="flex w-full flex-col items-start">
        <div className={`flex items-center gap-1 ${isMd ? "gap-1" : ""}`}>
          <p
            className={`font-body font-semibold text-gray-700 ${isMd ? "text-md" : "text-sm"}`}
          >
            {title}
          </p>
          {required && <span className="font-body text-sm font-semibold text-brand-600">*</span>}
          {helpText && (
            <span title={helpText} className="text-gray-400">
              <HelpCircleIcon className="size-4" />
            </span>
          )}
        </div>
        {supportingText && (
          <p className={`font-body text-gray-600 ${isMd ? "text-md" : "text-sm"}`}>{supportingText}</p>
        )}
      </div>
      {isMd && actions && <div className="flex items-start gap-2">{actions}</div>}
    </div>
  );
}
