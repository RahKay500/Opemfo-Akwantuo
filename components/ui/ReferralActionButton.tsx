"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReferralStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const NEXT_ACTION: Partial<Record<ReferralStatus, { status: ReferralStatus; label: string }>> = {
  SENT: { status: "ACKNOWLEDGED", label: "Acknowledge" },
  ACKNOWLEDGED: { status: "PATIENT_ARRIVED", label: "Mark Arrived" },
  PATIENT_ARRIVED: { status: "COMPLETED", label: "Mark Completed" },
};

export default function ReferralActionButton({
  referralId,
  status,
  className,
}: {
  referralId: string;
  status: ReferralStatus;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = NEXT_ACTION[status];
  if (!next) return null;

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/${referralId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next!.status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "shrink-0 rounded-input border-[1.5px] border-lilac-dark px-3 py-1.5 font-body text-xs font-medium text-lilac-deeper disabled:opacity-60",
        className
      )}
    >
      {loading ? "…" : next.label}
    </button>
  );
}
