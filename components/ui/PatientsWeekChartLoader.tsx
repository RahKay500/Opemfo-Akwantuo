"use client";

import dynamic from "next/dynamic";
import type { PatientsWeekPoint } from "@/components/ui/PatientsWeekChart";

// next/dynamic with ssr:false is only allowed from a Client Component, hence
// this thin wrapper — the dashboard page itself stays a Server Component.
const PatientsWeekChart = dynamic(() => import("@/components/ui/PatientsWeekChart"), { ssr: false });

export default function PatientsWeekChartLoader({ data }: { data: PatientsWeekPoint[] }) {
  return <PatientsWeekChart data={data} />;
}
