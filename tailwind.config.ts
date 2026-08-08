import type { Config } from "tailwindcss";

// Foundations pulled from the Figma design system file ("gfgfg" in the
// Figma MCP), page ❖ FOUNDATIONS → Colors/Typography/Spacing, radius & grids
// (node 1023:36350). This is a large generic SaaS kit (Untitled-UI-style).
// Its own "Brand" ramp is green — that's just the kit's generic template
// color, not this app's identity, so `brand` here is NOT that green scale.
// Instead `brand` uses this same system's own Fuchsia utility ramp (a real,
// separately-defined scale in the file): the app's old lilac (#AB49D5, hue
// 282°) sits ~9° from Fuchsia-600 (#BA24D5, hue 291°) vs. ~26° from the
// Purple ramp tried first (#6938EF, hue 256° — noticeably bluer) — every
// other scale (gray, success/warning/error/etc.)
// is taken as-is since those are legitimately system-defined neutrals/
// semantics, not a brand choice. This is Batch 1 (Foundations): the
// semantic names already used across every screen (primary, text-primary,
// border-color, critical/high/medium/low, etc.) are remapped to their
// nearest equivalent so the whole app re-themes immediately — no per-screen
// edits yet. Raw scales are also exposed under their own names for later
// batches (Base Components, Application Components) to build from directly.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Raw scales, straight from Figma variables ---
        // `brand` = the system's own Fuchsia utility ramp (Colors/Fuchsia/*),
        // used as this app's brand color — NOT the kit's demo green.
        brand: {
          25: "#fefaff",
          50: "#fdf4ff",
          100: "#fbe8ff",
          200: "#f6d0fe",
          300: "#eeaafd",
          400: "#e478fa",
          500: "#d444f1",
          600: "#ba24d5",
          700: "#9f1ab1",
          800: "#821890",
          900: "#6f1877",
          950: "#47104c",
        },
        gray: {
          25: "#fdfdfd",
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e9eaeb",
          300: "#d5d7da",
          400: "#a4a7ae",
          500: "#717680",
          600: "#535862",
          700: "#414651",
          800: "#252b37",
          900: "#181d27",
          950: "#0a0d12",
        },
        success: {
          25: "#f6fef9",
          50: "#ecfdf3",
          100: "#dcfae6",
          300: "#75e0a7",
          400: "#47cd89",
          500: "#17b26a",
          600: "#079455",
          700: "#067647",
          800: "#085d3a",
          900: "#074d31",
        },
        warning: {
          25: "#fffcf5",
          50: "#fffaeb",
          100: "#fef0c7",
          200: "#fedf89",
          300: "#fec84b",
          400: "#fdb022",
          500: "#f79009",
          600: "#dc6803",
          700: "#b54708",
          800: "#93370d",
          900: "#7a2e0e",
        },
        error: {
          25: "#fffbfa",
          50: "#fef3f2",
          100: "#fee4e2",
          200: "#fecdca",
          300: "#fda29b",
          400: "#f97066",
          500: "#f04438",
          600: "#d92d20",
          700: "#b42318",
          800: "#912018",
          900: "#7a271a",
        },
        yellow: {
          25: "#fefdf0",
          50: "#fefbe8",
          100: "#fef7c3",
          200: "#feee95",
          300: "#fde272",
          400: "#fac515",
          500: "#eaaa08",
          600: "#ca8504",
          700: "#a15c07",
          800: "#854a0e",
          900: "#713b12",
        },
        blue: {
          25: "#f5faff",
          50: "#eff8ff",
          100: "#d1e9ff",
          200: "#b2ddff",
          300: "#84caff",
          400: "#53b1fd",
          500: "#2e90fa",
          600: "#1570ef",
          700: "#175cd3",
          800: "#1849a9",
          900: "#194185",
        },
        purple: {
          25: "#fafaff",
          50: "#f4f3ff",
          100: "#ebe9fe",
          200: "#d9d6fe",
          300: "#bdb4fe",
          400: "#9b8afb",
          500: "#7a5af8",
          600: "#6938ef",
          700: "#5925dc",
          800: "#4a1fb8",
          900: "#3e1c96",
          950: "#27115f",
        },
        pink: {
          25: "#fef6fb",
          50: "#fdf2fa",
          100: "#fce7f6",
          200: "#fcceee",
          300: "#faa7e0",
          400: "#f670c7",
          500: "#ee46bc",
          600: "#dd2590",
          700: "#c11574",
          800: "#9e165f",
          900: "#851651",
        },
        fuchsia: {
          25: "#fefaff",
          50: "#fdf4ff",
          100: "#fbe8ff",
          200: "#f6d0fe",
          300: "#eeaafd",
          400: "#e478fa",
          500: "#d444f1",
          600: "#ba24d5",
          700: "#9f1ab1",
          800: "#821890",
          900: "#6f1877",
          950: "#47104c",
        },

        // --- Semantic aliases, remapped from the app's old lilac/pink
        // names to their nearest equivalent in the new system, so every
        // existing screen re-themes without per-file edits. ---
        primary: "#ba24d5", // brand-600 (system Fuchsia/600) — was #AB49D5
        "lilac-dark": "#ba24d5", // brand-600
        "lilac-deeper": "#821890", // brand-800
        "lilac-light": "#fdf4ff", // brand-50
        "lilac-mid": "#eeaafd", // brand-300
        surface: "#fefaff", // brand-25
        "pink-accent": "#ee46bc", // pink-500 (no brand-pink in the new system; nearest accent pop)
        "pink-light": "#fdf2fa", // pink-50
        "pink-deep": "#c11574", // pink-700
        "text-primary": "#181d27", // gray-900 / text-primary
        "text-secondary": "#414651", // gray-700 / text-secondary
        "border-color": "#d5d7da", // gray-300 / border-primary
        critical: { DEFAULT: "#d92d20", bg: "#fef3f2" }, // error-600 / error-50
        high: { DEFAULT: "#dc6803", bg: "#fffaeb" }, // warning-600 / warning-50
        medium: { DEFAULT: "#ca8504", bg: "#fefbe8" }, // yellow-600 / yellow-50
        low: { DEFAULT: "#079455", bg: "#ecfdf3" }, // success-600 / success-50
      },
      fontSize: {
        xs: ["12px", { lineHeight: "18px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "30px" }],
        "display-xs": ["24px", { lineHeight: "32px" }],
        "display-sm": ["30px", { lineHeight: "38px" }],
        "display-xl": ["60px", { lineHeight: "72px", letterSpacing: "-2px" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        card: "20px", // = radius-3xl, kept as its own name (used everywhere for cards)
        button: "14px", // component-specific value from Base Components → Buttons, not a Foundations token — revisit in that batch
        input: "12px", // = radius-xl
        badge: "999px", // = radius-full
      },
      boxShadow: {
        // Shadows/shadow-xs..3xl, straight from Figma's Effect styles page.
        xs: "0px 1px 2px 0px rgba(10,13,18,0.05)",
        sm: "0px 1px 3px 0px rgba(10,13,18,0.10), 0px 1px 2px -1px rgba(10,13,18,0.10)",
        md: "0px 4px 6px -1px rgba(10,13,18,0.10), 0px 2px 4px -2px rgba(10,13,18,0.06)",
        lg: "0px 12px 16px -4px rgba(10,13,18,0.08), 0px 4px 6px -2px rgba(10,13,18,0.03), 0px 2px 2px -1px rgba(10,13,18,0.04)",
        card: "0px 12px 16px -4px rgba(10,13,18,0.08), 0px 4px 6px -2px rgba(10,13,18,0.03), 0px 2px 2px -1px rgba(10,13,18,0.04)", // = shadow-lg, kept as its own name (used everywhere for cards)
        xl: "0px 20px 24px -4px rgba(10,13,18,0.08), 0px 8px 8px -4px rgba(10,13,18,0.03), 0px 3px 3px -1.5px rgba(10,13,18,0.04)",
        "2xl": "0px 24px 48px -12px rgba(10,13,18,0.18), 0px 4px 4px -2px rgba(10,13,18,0.04)",
        "3xl": "0px 32px 64px -12px rgba(10,13,18,0.14), 0px 5px 5px -2.5px rgba(10,13,18,0.04)",
        // Focus rings/focus-ring — a 2px background gap + 4px colored ring.
        // Uses our brand fuchsia (brand-500), not the system's green.
        "focus-ring": "0px 0px 0px 2px #ffffff, 0px 0px 0px 6px #d444f1",
      },
      backdropBlur: {
        // Backdrop blurs/backdrop-blur-*, straight from Figma — overrides
        // Tailwind's own defaults (4/12/16/24px) with the system's values.
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
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
