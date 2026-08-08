import { ChevronRightIcon, NavHomeIcon } from "./icons";

// Application Components → Breadcrumbs, "Breadcrumbs" component, pulled
// from the Figma design system ("gfgfg" in the Figma MCP), node
// 1122:153 (Divider=Chevron/Slash, Type=Text/Text with line/Button).
// Only "Divider=Chevron, Type=Text" is implemented — a home icon +
// chevron-separated crumb trail with the current (last) crumb colored
// brand-700 — the plain, most broadly reusable style. The "Button" type
// (each crumb as a bordered pill) and "Text with line" (an added
// bottom divider) are skipped as redundant given how breadcrumbs are
// already used across this app's headers. Standalone from PageHeader's
// own inline breadcrumb rendering so it can be dropped in anywhere
// (e.g. inside a CardHeader or on its own).
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
  className?: string;
}

export default function Breadcrumbs({ items, showHomeIcon = true, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 ${className ?? ""}`}>
      {showHomeIcon && <NavHomeIcon className="size-5 text-gray-500" />}
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const Tag = item.href && !isLast ? "a" : "span";
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {(showHomeIcon || i > 0) && <ChevronRightIcon className="size-4 text-gray-400" />}
            <Tag
              href={item.href}
              className={`font-body text-sm font-semibold whitespace-nowrap ${
                isLast ? "text-brand-700" : "text-gray-500"
              }`}
            >
              {item.label}
            </Tag>
          </span>
        );
      })}
    </nav>
  );
}
