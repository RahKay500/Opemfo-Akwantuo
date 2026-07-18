const VALUE_COLORS = {
  default: "#1A1A2E",
  purple: "#7C3AED",
  pink: "#DB2777",
  green: "#16A34A",
  orange: "#EA580C",
} as const;

export default function StatsCard({
  label,
  value,
  caption,
  color = "default",
}: {
  label: string;
  value: number | string;
  caption?: string;
  color?: keyof typeof VALUE_COLORS;
}) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold" style={{ color: VALUE_COLORS[color] }}>
        {value}
      </p>
      {caption && <p className="mt-1.5 text-xs text-[#6B7280]">{caption}</p>}
    </div>
  );
}
