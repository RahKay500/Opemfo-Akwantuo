import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

// Application Components → Application navigation, "_Nav item base"
// primitive, pulled from the Figma design system ("gfgfg" in the Figma
// MCP), node 1152:89220 (Current=True/False, State=Default/Hover/
// Focused). This is the one piece of the Application navigation page
// implemented — the full Sidebar navigation / Header navigation shells
// (5 styles × Dual-tier/Sections dividers/Sections subheadings/Slim/
// Simple, each at 2 breakpoints, plus a 12-variant "featured card" and an
// account-switcher card) are skipped entirely: this app's four portals
// (mother/midwife/doctor/admin) each already have a fully custom,
// working navigation shell tailored to their own information
// architecture (Sidebar, MidwifeSidebar, DoctorBottomNav, mother bottom
// nav) — replacing those with a generic shell here would be pure
// redundant scope, not a gap. The atomic nav item row itself (icon +
// label + current/hover state + optional badge/chevron) is genuinely
// reusable, so that's what's built.
export interface NavItemProps {
  label: string;
  icon?: ReactNode;
  current?: boolean;
  badge?: string;
  expandable?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function NavItem({ label, icon, current, badge, expandable, href, onClick, className }: NavItemProps) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      type={href ? undefined : "button"}
      aria-current={current ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-gray-50 ${
        current ? "bg-gray-50" : "bg-white"
      } ${className ?? ""}`}
    >
      <span className="flex flex-1 items-center gap-2 min-w-0">
        {icon && <span className={`shrink-0 size-5 ${current ? "text-gray-800" : "text-gray-600"}`}>{icon}</span>}
        <span className={`truncate font-body text-md font-semibold ${current ? "text-gray-800" : "text-gray-700"}`}>
          {label}
        </span>
      </span>
      {badge && (
        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 font-body text-xs font-medium text-gray-700">
          {badge}
        </span>
      )}
      {expandable && <ChevronRightIcon className="size-4 shrink-0 rotate-90 text-gray-500" />}
    </Tag>
  );
}
