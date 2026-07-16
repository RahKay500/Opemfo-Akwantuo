"use client";

import dynamic from "next/dynamic";
import type { MonthlyReferralsPoint } from "@/components/ui/MonthlyReferralsChart";

// next/dynamic with ssr:false is only allowed from a Client Component, hence
// this thin wrapper — the dashboard page itself stays a Server Component.
const MonthlyReferralsChart = dynamic(() => import("@/components/ui/MonthlyReferralsChart"), { ssr: false });

export default function MonthlyReferralsChartLoader({ data }: { data: MonthlyReferralsPoint[] }) {
  return <MonthlyReferralsChart data={data} />;
}
