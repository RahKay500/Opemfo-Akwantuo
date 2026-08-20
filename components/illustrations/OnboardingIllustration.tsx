// A mother, seated and at ease, one hand resting on her belly — surrounded
// by three small linked "care tokens" (vitals, referral, connection) that
// stand in for the app's actual job: tracking pregnancies, routing
// referrals, and keeping mother/midwife/doctor linked. Built as flat
// geometry from the app's own brand ramp (tailwind.config.ts `brand`
// scale), not a stock/AI illustration — kept abstract and skin-tone-neutral
// on purpose, since it represents every mother the app serves, not one.
export default function OnboardingIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="onboarding-chip-shadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#821890" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Soft background blob */}
      <path
        d="M150,20 C210,20 275,65 278,140 C281,215 225,280 150,280 C75,280 22,218 22,145 C22,72 90,20 150,20 Z"
        fill="#fdf4ff"
      />

      {/* Dashed links from each care token back to the figure */}
      <path d="M55,99 Q100,130 141,163" stroke="#eeaafd" strokeWidth="2" strokeDasharray="4 5" opacity="0.8" />
      <path d="M245,89 Q212,118 177,148" stroke="#eeaafd" strokeWidth="2" strokeDasharray="4 5" opacity="0.8" />
      <path d="M227,225 Q198,216 178,201" stroke="#eeaafd" strokeWidth="2" strokeDasharray="4 5" opacity="0.8" />

      {/* Scattered sparkle dots */}
      <circle cx="95" cy="48" r="3" fill="#eeaafd" opacity="0.8" />
      <circle cx="271" cy="150" r="2.5" fill="#ee46bc" opacity="0.55" />
      <circle cx="38" cy="207" r="3" fill="#ba24d5" opacity="0.3" />
      <circle cx="206" cy="36" r="2" fill="#c11574" opacity="0.5" />

      {/* Figure: dress, belly, arm, head, heart */}
      <path
        d="M115,130 C110,160 100,200 95,250 C95,270 110,282 150,282 C190,282 205,270 205,250 C200,200 190,160 185,130 C175,145 125,145 115,130 Z"
        fill="#ba24d5"
      />
      <ellipse cx="165" cy="210" rx="42" ry="38" fill="#9f1ab1" />
      <path d="M195,155 C205,175 200,200 178,208" stroke="#821890" strokeWidth="18" strokeLinecap="round" />
      <ellipse cx="150" cy="90" rx="32" ry="36" fill="#821890" />
      <circle cx="150" cy="58" r="10" fill="#821890" />
      <path
        d="M165,202 C163,198 157,198 157,203 C157,208 165,214 165,216 C165,214 173,208 173,203 C173,198 167,198 165,202 Z"
        fill="#ee46bc"
      />

      {/* Care tokens: vitals, referral, connection */}
      <g className="onboarding-float-1" filter="url(#onboarding-chip-shadow)">
        <circle cx="55" cy="75" r="24" fill="white" />
        <path
          d="M42,75 L48,75 L51,68 L56,84 L60,70 L64,75 L70,75"
          stroke="#ba24d5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g className="onboarding-float-2" filter="url(#onboarding-chip-shadow)">
        <circle cx="245" cy="65" r="24" fill="white" />
        <path
          d="M245,55 C251,55 255,59 255,65 C255,72 245,79 245,79 C245,79 235,72 235,65 C235,59 239,55 245,55 Z"
          fill="#c11574"
        />
        <circle cx="245" cy="64" r="3" fill="white" />
      </g>
      <g className="onboarding-float-3" filter="url(#onboarding-chip-shadow)">
        <circle cx="250" cy="225" r="24" fill="white" />
        <circle cx="245" cy="225" r="7" fill="none" stroke="#821890" strokeWidth="3" />
        <circle cx="255" cy="225" r="7" fill="none" stroke="#821890" strokeWidth="3" />
      </g>
    </svg>
  );
}
