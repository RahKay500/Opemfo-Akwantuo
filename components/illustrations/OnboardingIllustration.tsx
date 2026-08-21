// A mother, seated and at ease, one hand resting on her belly — surrounded
// by three small linked "care tokens" (vitals, referral, connection) that
// stand in for the app's actual job: tracking pregnancies, routing
// referrals, and keeping mother/midwife/doctor linked. Built as gradient-
// shaded geometry from the app's own brand ramp (tailwind.config.ts `brand`
// scale), not a stock/AI illustration — kept abstract and skin-tone-neutral
// on purpose, since it represents every mother the app serves, not one.
export default function OnboardingIllustration({
  className,
  idPrefix = "",
}: {
  className?: string;
  // The onboarding page renders this twice (desktop + mobile panels, both
  // present in the DOM at once, just toggled with CSS). SVG gradient/filter
  // ids are global to the document, so a second instance with the same ids
  // silently loses its own paint references — pass a distinct prefix per
  // instance to keep them unique.
  idPrefix?: string;
}) {
  const id = (name: string) => `${idPrefix}${name}`;

  return (
    <svg viewBox="0 0 300 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id={id("onboarding-chip-shadow")} x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#821890" floodOpacity="0.18" />
        </filter>
        <radialGradient id={id("ob-bg")} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fdf4ff" />
        </radialGradient>
        <radialGradient id={id("ob-glow")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ee46bc" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ee46bc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("ob-dress")} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#c341db" />
          <stop offset="100%" stopColor="#9f1ab1" />
        </linearGradient>
        <linearGradient id={id("ob-hair")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9f1ab1" />
          <stop offset="100%" stopColor="#6f1877" />
        </linearGradient>
        <radialGradient id={id("ob-belly")} cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#d658e6" />
          <stop offset="100%" stopColor="#821890" />
        </radialGradient>
        <linearGradient id={id("ob-chip")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fdf4ff" />
        </linearGradient>
      </defs>

      {/* Soft background blob + warm glow behind the figure */}
      <path
        d="M150,20 C210,20 275,65 278,140 C281,215 225,280 150,280 C75,280 22,218 22,145 C22,72 90,20 150,20 Z"
        fill={`url(#${id("ob-bg")})`}
      />
      <circle cx="163" cy="203" r="78" fill={`url(#${id("ob-glow")})`} />

      {/* Dashed links from each care token back to the figure */}
      <path d="M55,99 Q100,130 141,163" stroke="#eeaafd" strokeWidth="2" strokeDasharray="4 5" opacity="0.8" />
      <path d="M245,89 Q212,118 177,148" stroke="#eeaafd" strokeWidth="2" strokeDasharray="4 5" opacity="0.8" />
      <path d="M227,225 Q198,216 178,201" stroke="#eeaafd" strokeWidth="2" strokeDasharray="4 5" opacity="0.8" />

      {/* Scattered sparkle dots + one 4-point sparkle for variety */}
      <circle cx="95" cy="48" r="3" fill="#eeaafd" opacity="0.8" />
      <circle cx="271" cy="150" r="2.5" fill="#ee46bc" opacity="0.55" />
      <circle cx="38" cy="207" r="3" fill="#ba24d5" opacity="0.3" />
      <path d="M206,28 L209,35 L216,38 L209,41 L206,48 L203,41 L196,38 L203,35 Z" fill="#c11574" opacity="0.55" />

      {/* Figure: dress, belly glow, resting arm + hand, head, heart */}
      <path
        d="M113,128 C107,160 97,200 92,250 C92,271 108,283 150,283 C192,283 208,271 208,250 C203,200 193,160 187,128 C176,144 124,144 113,128 Z"
        fill={`url(#${id("ob-dress")})`}
      />
      <path d="M150,152 C148,184 148,224 150,278" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="163" cy="205" rx="43" ry="39" fill={`url(#${id("ob-belly")})`} />
      <path d="M195,158 C207,178 202,203 179,211" stroke="#9f1ab1" strokeWidth="17" strokeLinecap="round" />
      <circle cx="177" cy="210" r="9" fill="#9f1ab1" />
      <ellipse cx="150" cy="88" rx="32" ry="36" fill={`url(#${id("ob-hair")})`} />
      <circle cx="158" cy="55" r="9" fill={`url(#${id("ob-hair")})`} />
      <path
        d="M163,213 C161,210 154,206 154,200 C154,196 157,193 160,193 C162,193 163,194 163,196 C163,194 164,193 166,193 C170,193 173,196 173,200 C173,206 165,210 163,213 Z"
        fill="#ee46bc"
      />

      {/* Care tokens: vitals, referral, connection */}
      <g className="onboarding-float-1" filter={`url(#${id("onboarding-chip-shadow")})`}>
        <circle cx="55" cy="75" r="24" fill={`url(#${id("ob-chip")})`} stroke="#eeaafd" strokeWidth="1.5" />
        <path
          d="M42,75 L48,75 L51,68 L56,84 L60,70 L64,75 L70,75"
          stroke="#ba24d5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g className="onboarding-float-2" filter={`url(#${id("onboarding-chip-shadow")})`}>
        <circle cx="245" cy="65" r="24" fill={`url(#${id("ob-chip")})`} stroke="#f3c8e6" strokeWidth="1.5" />
        <path
          d="M245,55 C251,55 255,59 255,65 C255,72 245,79 245,79 C245,79 235,72 235,65 C235,59 239,55 245,55 Z"
          fill="#c11574"
        />
        <circle cx="245" cy="64" r="3" fill="white" />
      </g>
      <g className="onboarding-float-3" filter={`url(#${id("onboarding-chip-shadow")})`}>
        <circle cx="250" cy="225" r="24" fill={`url(#${id("ob-chip")})`} stroke="#d9b8e0" strokeWidth="1.5" />
        <circle cx="245" cy="225" r="7" fill="none" stroke="#821890" strokeWidth="3" />
        <circle cx="255" cy="225" r="7" fill="none" stroke="#821890" strokeWidth="3" />
      </g>
    </svg>
  );
}
