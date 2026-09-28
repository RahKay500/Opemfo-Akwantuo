"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "@/components/ui/BottomSheet";
import { LAB_TEST_TYPES } from "@/lib/validations/lab-requests";

export default function RequestLabTestSheet({
  patientId,
  patientName,
  open,
  onClose,
}: {
  patientId: string;
  patientName: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [testType, setTestType] = useState<(typeof LAB_TEST_TYPES)[number]>(LAB_TEST_TYPES[0]);
  const [testTypeOther, setTestTypeOther] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleRequest() {
    const finalTestType = testType === "Other" ? testTypeOther.trim() : testType;
    if (!finalTestType) {
      setError("Enter the test to request.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lab-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, testType: finalTestType, notes: notes.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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
    setTestType(LAB_TEST_TYPES[0]);
    setTestTypeOther("");
    setNotes("");
    setError(null);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
        {sent ? (
          <>
            <p className="font-heading text-lg font-bold text-text-primary">Test requested</p>
            <p className="font-body text-sm text-text-secondary">
              The lab has been notified. You&apos;ll be able to see the result under My Lab Requests once it&apos;s ready.
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
            <p className="font-heading text-lg font-bold text-text-primary">Request Lab Test</p>
            <p className="font-body text-sm text-text-secondary">
              Send a test request for {patientName} to the facility&apos;s lab.
            </p>

            <div>
              <label className="font-body text-sm font-medium text-text-primary">Test</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as (typeof LAB_TEST_TYPES)[number])}
                className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              >
                {LAB_TEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {testType === "Other" && (
              <div>
                <label className="font-body text-sm font-medium text-text-primary">Specify test</label>
                <input
                  value={testTypeOther}
                  onChange={(e) => setTestTypeOther(e.target.value)}
                  placeholder="e.g. Rapid malaria test"
                  className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>
            )}

            <div>
              <label className="font-body text-sm font-medium text-text-primary">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any context for the lab technician"
                className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

            <button
              type="button"
              onClick={handleRequest}
              disabled={submitting}
              className="h-12 w-full rounded-button bg-primary font-heading text-base font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Requesting…" : "Request Test"}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
