"use client";

import dynamic from "next/dynamic";
import type { BPGraphPoint } from "@/components/ui/BPGraph";

// next/dynamic with ssr:false is only allowed from a Client Component, hence
// this thin wrapper — the records page itself stays a Server Component.
const BPGraph = dynamic(() => import("@/components/ui/BPGraph"), { ssr: false });

export default function BPGraphLoader({ data }: { data: BPGraphPoint[] }) {
  return <BPGraph data={data} />;
}
