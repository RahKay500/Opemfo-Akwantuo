import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/zod-config";

// Both CSS vars now load Inter — the Figma design system ("gfgfg") specifies
// "Inter Display" for every text/display style, headings included. Google
// Fonts has no separate "Inter Display" family, so this is the same Inter
// family the system actually ships (the "display" cut only affects optical
// sizing at very large sizes, which next/font's variable Inter already
// handles). Two instances, kept bound to the existing --font-nunito/--font-
// inter variable names so tailwind.config.ts's `heading`/`body` keys (used
// throughout the app) don't need touching — this is a Foundations-level
// token swap, not a rename.
const heading = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ɔpemfoɔ Akwantuo",
  description:
    "Smart Maternal Health Referral and Monitoring System for Ghana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${heading.variable} ${inter.variable} font-body antialiased bg-surface`}
      >
        {children}
      </body>
    </html>
  );
}
