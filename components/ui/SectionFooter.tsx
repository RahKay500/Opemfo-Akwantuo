import type { ReactNode } from "react";

// Application Components → Section footers, "Section footer" component,
// pulled from the Figma design system ("gfgfg" in the Figma MCP), node
// 3275:372571 (Type=Section/Card, Button group=True/False,
// Breakpoint=Desktop/Mobile). Top divider + a content row: an optional
// leading slot (Figma's example fills it with a segmented Button group,
// but any leading content — or none — works since this app already has a
// ButtonGroup primitive the consumer can drop in) and a right-aligned
// actions slot. "Card" vs "Section" in Figma only differ by horizontal/
// bottom padding, exposed here as the `padded` prop.
export interface SectionFooterProps {
  leading?: ReactNode;
  actions?: ReactNode;
  divider?: boolean;
  padded?: boolean;
  className?: string;
}

export default function SectionFooter({
  leading,
  actions,
  divider = true,
  padded = false,
  className,
}: SectionFooterProps) {
  return (
    <div className={`flex w-full flex-col items-center gap-4 ${padded ? "pb-4" : ""} ${className ?? ""}`}>
      {divider && <div className="h-px w-full bg-gray-200" />}
      <div className={`flex w-full items-center justify-end gap-4 ${padded ? "px-6" : ""}`}>
        {leading}
        {actions && <div className="flex flex-1 items-center justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
}
