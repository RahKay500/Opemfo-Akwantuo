// Application Components → Loading indicators, "Loading indicator"
// component, pulled from the Figma design system ("gfgfg" in the Figma
// MCP), node 1192:610 (Style=Line simple/Line spinner/Dot circle,
// Size=sm/md/lg/xl). Only "Line simple" is implemented — a spinning
// ring, reimplemented as a live CSS-animated SVG rather than Figma's
// static PNG asset (which can't actually spin). "Line spinner" (a
// track+arc variant of the same idea) and "Dot circle" (three pulsing
// dots) are skipped as redundant with this one spinner covering every
// loading-state need in the app.
export type LoadingIndicatorSize = "sm" | "md" | "lg" | "xl";

export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  label?: string;
  className?: string;
}

const SIZE_PX: Record<LoadingIndicatorSize, number> = { sm: 32, md: 48, lg: 56, xl: 64 };

export default function LoadingIndicator({ size = "md", label, className }: LoadingIndicatorProps) {
  const px = SIZE_PX[size];
  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ""}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        className="animate-spin text-brand-600"
        role="status"
        aria-label={label ?? "Loading"}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {label && <p className="font-body text-sm font-medium text-gray-700">{label}</p>}
    </div>
  );
}
