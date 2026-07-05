import type { Config } from "tailwindcss";

// Colors, radii, and shadow verified against the Figma Style Guide page (node 2:12).
// lilac-deeper is #9B4DC8 per the Figma swatch, not the #6A1F8A originally drafted.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E4A8F3",
        "lilac-dark": "#C178E0",
        "lilac-deeper": "#9B4DC8",
        "lilac-light": "#F5E0FB",
        surface: "#FAF0FD",
        "pink-accent": "#F472B6",
        "pink-light": "#FCE7F3",
        "pink-deep": "#DB2777",
        "text-primary": "#1A1A2E",
        "text-secondary": "#6B7280",
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
