// Application Components → Content dividers, "Content divider" component,
// pulled from the Figma design system ("gfgfg" in the Figma MCP), node
// 1252:126874 (Type=Heading/Text/Button/Button icon/Button group[
// icon], Style=Single line/Dual line/Background fill/Full line/Border
// line/Border Dashed line). Only "Type=Text/Heading, Style=Single line"
// is implemented — a horizontal rule split by a centered label — the
// plain "OR" / section-label divider pattern. The button-embedded and
// dual-line/background-fill styles are skipped as low-value variants on
// the same idea; a plain divider with a label covers this app's actual
// needs (e.g. separating date-grouped list sections).
export interface ContentDividerProps {
  label: string;
  variant?: "text" | "heading";
  className?: string;
}

export default function ContentDivider({ label, variant = "text", className }: ContentDividerProps) {
  return (
    <div className={`flex w-full items-center gap-2 ${className ?? ""}`}>
      <div className="h-px flex-1 bg-gray-200" />
      <p
        className={`shrink-0 whitespace-nowrap text-center font-body ${
          variant === "heading" ? "font-heading text-lg font-semibold text-gray-900" : "text-sm font-medium text-gray-600"
        }`}
      >
        {label}
      </p>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
