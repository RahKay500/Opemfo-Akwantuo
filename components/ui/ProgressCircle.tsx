// Base Components → Progress indicators → "Progress circle", pulled from
// the Figma design system ("gfgfg" in the Figma MCP), node 1084:2717
// (Size=xxs/xs/sm/md/lg, Shape=Circle/Half circle). Figma renders the ring
// via static pre-baked SVG assets per percentage, which can't drive an
// arbitrary `value` prop — reimplemented here as a live SVG circle with
// `strokeDasharray`/`strokeDashoffset` instead, same track (gray-200) /
// fill (brand-600) colors. Only the full-circle shape is implemented; the
// "Half circle" gauge variant is skipped — no gauge-style UI in this app.
export type ProgressCircleSize = "xxs" | "xs" | "sm" | "md" | "lg";

export interface ProgressCircleProps {
  value: number;
  size?: ProgressCircleSize;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const DIAMETER: Record<ProgressCircleSize, number> = { xxs: 64, xs: 160, sm: 200, md: 240, lg: 280 };
const STROKE: Record<ProgressCircleSize, number> = { xxs: 6, xs: 8, sm: 10, md: 12, lg: 14 };
const VALUE_TEXT: Record<ProgressCircleSize, string> = {
  xxs: "text-sm font-semibold",
  xs: "text-lg font-semibold",
  sm: "text-2xl font-semibold",
  md: "text-4xl font-semibold",
  lg: "text-4xl font-semibold",
};

export default function ProgressCircle({
  value,
  size = "md",
  label,
  showValue = true,
  className,
}: ProgressCircleProps) {
  const pct = Math.min(100, Math.max(0, value));
  const d = DIAMETER[size];
  const stroke = STROKE[size];
  const r = (d - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className={`inline-flex flex-col items-center ${className ?? ""}`}>
      <div className="relative" style={{ width: d, height: d }}>
        <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} className="-rotate-90">
          <circle cx={d / 2} cy={d / 2} r={r} strokeWidth={stroke} className="stroke-gray-200" fill="none" />
          <circle
            cx={d / 2}
            cy={d / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-brand-600"
            fill="none"
          />
        </svg>
        {(showValue || label) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {label && <span className="font-body text-sm font-medium text-gray-600">{label}</span>}
            {showValue && <span className={`font-heading text-gray-900 ${VALUE_TEXT[size]}`}>{pct}%</span>}
          </div>
        )}
      </div>
    </div>
  );
}
