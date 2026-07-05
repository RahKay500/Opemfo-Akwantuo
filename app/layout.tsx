import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
        className={`${nunito.variable} ${inter.variable} font-body antialiased bg-surface`}
      >
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
