// Base Components → Progress indicators → "Progress bar", pulled from the
// Figma design system ("gfgfg" in the Figma MCP), node 1085:57382 (Progress=
// 0–100%, Label=Right/Bottom/False). Track = bg-gray-200, full rounded, h-2;
// fill = bg-brand-600, rounded-full, width driven by `value`. Label text is
// text-sm medium text-gray-700. The "Top floating"/"Bottom floating" label
// variants (a percentage badge that tracks the fill's leading edge) aren't
// implemented — no usage in this app needs a floating badge over the bar
// itself, a plain right/bottom label covers every case.
export type ProgressBarLabel = "right" | "bottom" | false;

export interface ProgressBarProps {
  value: number;
  label?: ProgressBarLabel;
  className?: string;
}

export default function ProgressBar({ value, label = false, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const track = (
    <div className="h-2 w-full shrink-0 rounded-full bg-gray-200">
      <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
    </div>
  );
  const text = <span className="shrink-0 font-body text-sm font-medium text-gray-700">{pct}%</span>;

  if (label === "right") {
    return (
      <div className={`flex items-center gap-3 ${className ?? ""}`}>
        {track}
        {text}
      </div>
    );
  }
  if (label === "bottom") {
    return (
      <div className={`flex flex-col items-end gap-2 ${className ?? ""}`}>
        {track}
        {text}
      </div>
    );
  }
  return <div className={className}>{track}</div>;
}
