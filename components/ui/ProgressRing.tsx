const SIZES = {
  md: { box: "size-20", viewBox: "0 0 80 80", center: 40, radius: 34, percentText: "text-base" },
  lg: { box: "size-24", viewBox: "0 0 96 96", center: 48, radius: 41, percentText: "text-lg" },
};

export default function ProgressRing({
  percent,
  showCaption = false,
  size = "md",
}: {
  percent: number;
  showCaption?: boolean;
  size?: keyof typeof SIZES;
}) {
  const { box, viewBox, center, radius, percentText } = SIZES[size];
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className={`relative ${box}`}>
      <svg viewBox={viewBox} className={`${box} -rotate-90`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#EDD5F9" strokeWidth="8" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#C178E0"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading ${percentText} font-bold text-text-primary`}>{percent}%</span>
        {showCaption && <span className="font-body text-[9px] text-text-secondary">complete</span>}
      </div>
    </div>
  );
}
