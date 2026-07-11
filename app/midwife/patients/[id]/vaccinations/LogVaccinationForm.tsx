"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = ["TD", "IPTP", "DEWORMING"] as const;
const CATEGORY_LABEL: Record<(typeof CATEGORIES)[number], string> = {
  TD: "Td",
  IPTP: "IPTp",
  DEWORMING: "Deworming",
};

export default function LogVaccinationForm({ patientId, week }: { patientId: string; week: number | null }) {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("TD");
  const [doseNumber, setDoseNumber] = useState("1");
  const [dateGiven, setDateGiven] = useState(() => new Date().toISOString().slice(0, 10));
  const [batchNumber, setBatchNumber] = useState("");
  const [gestationalAge, setGestationalAge] = useState(week != null ? String(week) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!doseNumber || !dateGiven) {
      setError("Enter a dose number and date given.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/vaccinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          doseNumber: Number(doseNumber),
          dateGiven,
          batchNumber: category === "TD" ? batchNumber.trim() || undefined : undefined,
          gestationalAge: gestationalAge ? Number(gestationalAge) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      router.push(`/midwife/patients/${patientId}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-6 pb-10 pt-5">
      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Type</label>
        <div className="mt-2 flex rounded-badge bg-lilac-light p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "flex-1 rounded-badge py-2.5 text-center font-heading text-sm font-bold",
                category === c ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
              )}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Dose number</label>
        <input
          type="number"
          min={1}
          value={doseNumber}
          onChange={(e) => setDoseNumber(e.target.value)}
          placeholder="e.g. 1"
          className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Date given</label>
        <input
          type="date"
          value={dateGiven}
          onChange={(e) => setDateGiven(e.target.value)}
          className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      {category === "TD" && (
        <div>
          <label className="font-body text-[13px] font-medium text-text-secondary">Batch number</label>
          <input
            type="text"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="Optional"
            className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </div>
      )}

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Gestational age (weeks)</label>
        <input
          type="number"
          value={gestationalAge}
          onChange={(e) => setGestationalAge(e.target.value)}
          placeholder="Optional"
          className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="h-14 w-full rounded-card bg-primary font-heading text-[17px] font-bold text-white disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save Dose"}
      </button>
    </div>
  );
}
