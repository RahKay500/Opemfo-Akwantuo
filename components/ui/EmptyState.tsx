import type { ReactNode } from "react";

// Application Components → Empty states, "Empty state" component,
// pulled from the Figma design system ("gfgfg" in the Figma MCP), node
// 1182:317 (Icon=Featured icon/Illustration/File type icon/Folder icon,
// Size=sm/md/lg). Only "Featured icon" is implemented — a bordered
// square icon + title + supportingText + actions row — the plain,
// broadly reusable style. The Illustration/File type/Folder icon
// variants are decorative SaaS-dashboard flourishes that don't fit this
// app's utilitarian, mobile-first screens; this app's existing empty
// states (patient lists, log vitals, dashboard) are hand-rolled inline
// today, which this primitive is meant to replace over time.
export type EmptyStateSize = "sm" | "md";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  size?: EmptyStateSize;
  className?: string;
}

export default function EmptyState({ icon, title, description, actions, size = "sm", className }: EmptyStateProps) {
  const isMd = size === "md";
  return (
    <div className={`flex w-full flex-col items-center ${isMd ? "gap-8" : "gap-6"} ${className ?? ""}`}>
      <div className={`flex w-full flex-col items-center ${isMd ? "gap-5" : "gap-4"}`}>
        {icon && (
          <span className="flex size-12 items-center justify-center rounded-lg border border-gray-300 text-gray-600">
            {icon}
          </span>
        )}
        <div className={`flex w-full max-w-[352px] flex-col items-center text-center ${isMd ? "gap-2" : "gap-1"}`}>
          <p className={`font-heading font-semibold text-gray-900 ${isMd ? "text-lg" : "text-md"}`}>{title}</p>
          {description && <p className="font-body text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-start gap-3">{actions}</div>}
    </div>
  );
}
