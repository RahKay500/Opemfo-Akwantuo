export default function ProgressRing({
  percent,
  onDark = false,
  showCaption = false,
}: {
  percent: number;
  onDark?: boolean;
  showCaption?: boolean;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative size-20">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={onDark ? "rgba(255,255,255,0.3)" : "#EDD5F9"}
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={onDark ? "#FFFFFF" : "#C178E0"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {onDark ? (
          <div className="flex size-14 flex-col items-center justify-center rounded-badge bg-white">
            <span className="font-heading text-sm font-bold text-text-primary">{percent}%</span>
            {showCaption && <span className="font-body text-[8px] text-text-secondary">complete</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="font-heading text-base font-bold text-text-primary">{percent}%</span>
            {showCaption && <span className="font-body text-[9px] text-text-secondary">complete</span>}
          </div>
        )}
      </div>
    </div>
  );
}
