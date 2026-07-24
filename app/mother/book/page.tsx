"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarIcon, PartnerIcon, CheckIcon } from "@/components/ui/icons";

const REQUEST_TYPES = [
  {
    value: "ROUTINE" as const,
    icon: CalendarIcon,
    iconBg: "bg-lilac-light",
    iconColor: "text-lilac-deeper",
    title: "Routine Appointment",
    blurb: "Regular antenatal or postnatal check-up with your midwife",
  },
  {
    value: "GYNAECOLOGIST" as const,
    icon: PartnerIcon,
    iconBg: "bg-pink-light",
    iconColor: "text-pink-deep",
    title: "Gynaecologist Referral",
    blurb: "Request a specialist review from a doctor at the district hospital",
  },
];

const TIMES = ["Morning", "Afternoon", "Evening"];

export default function MotherBookPage() {
  const router = useRouter();
  const [requestType, setRequestType] = useState<"ROUTINE" | "GYNAECOLOGIST">("ROUTINE");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!preferredDate) {
      setError("Choose a preferred date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          preferredDate,
          preferredTime: preferredTime || undefined,
          reason: reason.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-badge bg-[#F0FDF4]">
          <CheckIcon className="size-7 text-[#16A34A]" />
        </div>
        <h1 className="font-heading text-xl font-bold text-text-primary">Request sent</h1>
        <p className="font-body text-sm text-text-secondary">
          Your nurse will confirm your appointment via SMS.
        </p>
        <button
          type="button"
          onClick={() => router.push("/mother/dashboard")}
          className="mt-2 h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-white"
        >
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:pb-0 lg:pt-8 lg:text-left">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Book a Visit</h1>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-8 pt-5">
        <div>
          <p className="font-body text-sm font-medium text-text-primary">What do you need?</p>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setRequestType(type.value)}
                className={cn(
                  "flex flex-col items-start rounded-card border-2 p-5 text-left shadow-card",
                  requestType === type.value ? "border-primary bg-surface" : "border-border-color bg-white"
                )}
              >
                <div className={cn("flex size-12 items-center justify-center rounded-badge", type.iconBg)}>
                  <type.icon className={cn("size-[22px]", type.iconColor)} />
                </div>
                <p className="mt-2 font-heading text-base font-bold text-text-primary">{type.title}</p>
                <p className="mt-1 font-body text-[13px] text-text-secondary">{type.blurb}</p>
                {requestType === type.value && (
                  <span className="mt-2 flex size-5 items-center justify-center rounded-badge bg-primary">
                    <CheckIcon className="size-3 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:rounded-card lg:bg-white lg:p-6 lg:shadow-card">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            <div>
              <label className="font-body text-[13px] font-medium text-text-secondary">Preferred date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-body text-[13px] font-medium text-text-secondary">Preferred time</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              >
                <option value="">Any time</option>
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-body text-[13px] font-medium text-text-secondary">Reason for visit</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Regular check-up"
              className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-body text-[13px] font-medium text-text-secondary">Additional notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any concerns to mention?"
              rows={3}
              className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-4 font-body text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>
        </div>

        {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

        <div className="lg:text-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-white disabled:opacity-60 lg:mx-auto lg:w-auto lg:px-16"
          >
            {submitting ? "Sending…" : "Request Appointment"}
          </button>
          <p className="mt-2.5 text-center font-body text-xs text-[#9CA3AF]">
            Your nurse will confirm your appointment via SMS.
          </p>
        </div>
      </div>
    </main>
  );
}
