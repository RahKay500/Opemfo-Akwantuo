"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "@/components/ui/BottomSheet";

interface DoctorOption {
  id: string;
  name: string;
  facilityName: string;
}

export default function ShareRecordSheet({
  patientId,
  patientName,
  doctors,
  open,
  onClose,
}: {
  patientId: string;
  patientName: string;
  doctors: DoctorOption[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleShare() {
    if (!doctorId) {
      setError("Choose a doctor to share with.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${patientId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, reason: reason.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSent(false);
    setReason("");
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
        {sent ? (
          <>
            <p className="font-heading text-lg font-bold text-text-primary">Record shared</p>
            <p className="font-body text-sm text-text-secondary">
              A read-only copy of {patientName}&apos;s record is available to the doctor for 48 hours.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="h-12 w-full rounded-button bg-primary font-heading text-base font-bold text-white"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <p className="font-heading text-lg font-bold text-text-primary">Share with Gynaecologist</p>
            <p className="font-body text-sm text-text-secondary">
              Grant a doctor read-only access to {patientName}&apos;s record for 48 hours.
            </p>

            <div>
              <label className="font-body text-sm font-medium text-text-primary">Doctor</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              >
                {doctors.length === 0 && <option value="">No doctors available</option>}
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.facilityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-body text-sm font-medium text-text-primary">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Requesting specialist opinion on elevated BP"
                className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

            <button
              type="button"
              onClick={handleShare}
              disabled={submitting || doctors.length === 0}
              className="h-12 w-full rounded-button bg-primary font-heading text-base font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Sharing…" : "Share Record"}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
