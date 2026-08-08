import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

// Application Components → Page headers, "Page header" component, pulled
// from the Figma design system ("gfgfg" in the Figma MCP), node
// 1239:122640 (Style=Simple/Avatar/Banner avatar/Banner avatar centered/
// Banner simple centered/Banner simple, Breakpoint=Desktop/Mobile). Only
// the "Simple" style is implemented — title, optional supporting text,
// optional breadcrumbs, optional actions slot, optional divider. The
// Avatar/Banner styles (a large profile photo or cover-image band behind
// the title) aren't implemented: every screen in this app that needs a
// profile-style header already has its own bespoke hero (mother/midwife/
// doctor dashboards, admin Sidebar), so a second competing header
// primitive for that case isn't needed. The built-in search box variant
// is also skipped — pages that need search already own their own search
// input placement, this primitive only owns title/breadcrumbs/actions.
export interface PageHeaderCrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  supportingText?: string;
  breadcrumbs?: PageHeaderCrumb[];
  actions?: ReactNode;
  divider?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  supportingText,
  breadcrumbs,
  actions,
  divider = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={`flex w-full flex-col items-start gap-4 ${className ?? ""}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRightIcon className="size-4 text-gray-400" />}
                <span
                  className={`rounded-sm px-2 py-1 font-body text-sm font-semibold ${
                    isLast ? "bg-gray-50 text-gray-700" : "text-gray-500"
                  }`}
                >
                  {crumb.label}
                </span>
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex w-full flex-wrap items-start gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-gray-900">{title}</h1>
          {supportingText && <p className="font-body text-md text-gray-600">{supportingText}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
      {divider && <div className="h-px w-full bg-gray-200" />}
    </div>
  );
}
