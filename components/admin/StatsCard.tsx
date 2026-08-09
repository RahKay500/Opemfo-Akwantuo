import type { ComponentType, SVGProps } from "react";

const VALUE_COLORS = {
  default: "#1A1A2E",
  purple: "#9F1AB1",
  blue: "#2663EB",
  pink: "#DB2777",
  green: "#16A34A",
  orange: "#EA580C",
} as const;

const ICON_BG = {
  default: "#F1F5F9",
  purple: "#FDF4FF",
  blue: "#EFF6FF",
  pink: "#FDF2F8",
  green: "#F0FDF4",
  orange: "#FFF7ED",
} as const;

export default function StatsCard({
  label,
  value,
  caption,
  color = "default",
  icon: Icon,
}: {
  label: string;
  value: number | string;
  caption?: string;
  color?: keyof typeof VALUE_COLORS;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">{label}</p>
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: ICON_BG[color] }}
        >
          <Icon className="size-4" style={{ color: VALUE_COLORS[color] }} />
        </span>
      </div>
      <p className="mt-1.5 text-3xl font-semibold" style={{ color: VALUE_COLORS[color] }}>
        {value}
      </p>
      {caption && <p className="mt-1.5 text-xs text-[#6B7280]">{caption}</p>}
    </div>
  );
}
