"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import type { MidwifeAppointmentListItem } from "@/lib/queries/midwife-appointments";
import type { AppointmentStatus } from "@prisma/client";

const FILTERS = ["Pending", "Confirmed", "Declined", "All"] as const;

const STATUS_STYLE: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-[#FFFBEB]", text: "text-[#B45309]", label: "Pending" },
  CONFIRMED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Confirmed" },
  DECLINED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Declined" },
};

const REQUEST_TYPE_LABEL: Record<string, string> = {
  ROUTINE: "Routine Appointment",
  GYNAECOLOGIST: "Gynaecologist Referral",
};

export default function AppointmentQueueClient({ appointments }: { appointments: MidwifeAppointmentListItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Pending");
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = appointments.filter((a) => filter === "All" || a.status.toLowerCase() === filter.toLowerCase());

  async function act(id: string, status: "CONFIRMED" | "DECLINED") {
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto px-5 pb-1 pt-5 lg:pt-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-badge border-[1.5px] px-4 py-2 font-body text-[13px] font-medium",
              filter === f ? "border-primary bg-primary text-white" : "border-border-color bg-white text-text-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="px-5 pt-3 font-body text-sm text-[#DC2626]">{error}</p>}

      <div className="flex flex-col gap-3 px-5 pb-8 pt-4 lg:grid lg:grid-cols-2 lg:gap-4">
        {filtered.length === 0 && (
          <p className="col-span-2 py-8 text-center font-body text-sm text-text-secondary">
            No {filter.toLowerCase()} appointment requests.
          </p>
        )}
        {filtered.map((a) => {
          const status = STATUS_STYLE[a.status];
          return (
            <div key={a.id} className="rounded-card bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-heading text-base font-bold text-text-primary">{a.patientName}</p>
                  <p className="mt-0.5 font-body text-[13px] text-text-secondary">
                    {REQUEST_TYPE_LABEL[a.requestType] ?? a.requestType}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-badge px-2.5 py-1 font-body text-xs font-medium", status.bg, status.text)}>
                  {status.label}
                </span>
              </div>
              <p className="mt-2.5 font-body text-sm text-text-primary">
                {formatDate(a.preferredDate)}
                {a.preferredTime ? ` · ${a.preferredTime}` : ""}
              </p>
              {a.reason && <p className="mt-1 font-body text-[13px] text-text-secondary">{a.reason}</p>}
              {a.notes && <p className="mt-1 font-body text-[13px] text-text-secondary">{a.notes}</p>}
              {a.status === "PENDING" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={actingId === a.id}
                    onClick={() => act(a.id, "CONFIRMED")}
                    className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-input bg-primary font-body text-[13px] font-bold text-white disabled:opacity-60"
                  >
                    <CheckIcon className="size-3.5" />
                    Confirm
                  </button>
                  <button
                    type="button"
                    disabled={actingId === a.id}
                    onClick={() => act(a.id, "DECLINED")}
                    className="flex h-[38px] flex-1 items-center justify-center gap-1.5 rounded-input border-[1.5px] border-border-color font-body text-[13px] font-medium text-text-secondary disabled:opacity-60"
                  >
                    <XIcon className="size-3.5" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
