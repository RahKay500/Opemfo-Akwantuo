import type { Config } from "tailwindcss";

// Colors, radii, and shadow verified against the Figma Style Guide page (node 2:12).
// lilac-deeper is #9B4DC8 per the Figma swatch, not the #6A1F8A originally drafted.
// lilac-dark/lilac-deeper/pink-deep were darkened slightly from their original Figma
// values to pass WCAG AA contrast (4.5:1) against bg-primary/light backgrounds —
// a real Lighthouse accessibility failure, not a stylistic change. text-secondary
// was already passing (4.34:1) but nudged up to clear 4.5:1 with margin.
// primary was later changed by request from the original light Figma lilac
// (#E4A8F3) to the same dark shade as lilac-deeper — every place that paired
// bg-primary with text-lilac-deeper was swept to text-white to stay readable.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6E2E94",
        "lilac-dark": "#AB49D5",
        "lilac-deeper": "#6E2E94",
        "lilac-light": "#F5E0FB",
        surface: "#FAF0FD",
        "pink-accent": "#F472B6",
        "pink-light": "#FCE7F3",
        "pink-deep": "#D12371",
        "text-primary": "#1A1A2E",
        "text-secondary": "#696F7D",
        "border-color": "#EDD5F9",
        critical: { DEFAULT: "#DC2626", bg: "#FEF2F2" },
        high: { DEFAULT: "#EA580C", bg: "#FFF7ED" },
        medium: { DEFAULT: "#CA8A04", bg: "#FEFCE8" },
        low: { DEFAULT: "#16A34A", bg: "#F0FDF4" },
      },
      borderRadius: {
        card: "20px",
        button: "14px",
        input: "12px",
        badge: "999px",
      },
      boxShadow: {
        card: "0px 2px 12px rgba(228, 168, 243, 0.15)",
      },
      fontFamily: {
        heading: ["var(--font-nunito)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
