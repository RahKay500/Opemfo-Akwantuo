"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import SymptomChip from "@/components/ui/SymptomChip";

const SYMPTOMS = [
  "Fever",
  "Headache",
  "Dizziness",
  "Nausea / Vomiting",
  "Swollen feet",
  "Blurred vision",
  "Abdominal pain",
  "Difficulty breathing",
  "Reduced fetal movement",
  "Vaginal bleeding",
  "Back pain",
  "Fatigue",
];

const SEVERITIES = [
  { value: "MILD" as const, emoji: "🟡", label: "Mild", blurb: "Manageable" },
  { value: "MODERATE" as const, emoji: "🟠", label: "Moderate", blurb: "Uncomfortable" },
  { value: "SEVERE" as const, emoji: "🔴", label: "Severe", blurb: "Very painful" },
];

const STARTED_WHEN_OPTIONS = ["Today", "2–3 days ago", "A week ago"];

export default function MotherSymptomsPage() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"MILD" | "MODERATE" | "SEVERE" | null>(null);
  const [notes, setNotes] = useState("");
  const [startedWhen, setStartedWhen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleSubmit() {
    setError(null);
    if (!severity) {
      setError("Let your nurse know how severe it feels.");
      return;
    }
    if (selectedSymptoms.length === 0 && !notes.trim()) {
      setError("Select at least one symptom or describe how you're feeling.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          severity,
          notes: notes.trim() || undefined,
          startedWhen: startedWhen ?? undefined,
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
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="font-heading text-xl font-bold text-text-primary">Sent to your nurse</h1>
        <p className="font-body text-sm text-text-secondary">
          Your nurse will review this and reach out if needed.
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
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">How are you feeling?</h1>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-5 lg:max-w-2xl">
        <div className="rounded-card bg-lilac-light p-4">
          <p className="font-body text-sm text-lilac-deeper">
            Tell your nurse how you&apos;re feeling. This helps them monitor your health between visits.
          </p>
        </div>

        {/* Each column is its own independent-height flex stack (not shared grid
            rows) so a short right-column card doesn't inherit empty space from
            a taller left-column card in the same row. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-6">
          <div className="flex flex-col gap-6">
            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:shadow-card">
              <p className="font-body text-sm font-medium text-text-primary">Select any symptoms you have</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {SYMPTOMS.map((symptom) => (
                  <SymptomChip
                    key={symptom}
                    label={symptom}
                    selected={selectedSymptoms.includes(symptom)}
                    onClick={() => toggleSymptom(symptom)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:shadow-card">
              <p className="font-body text-sm font-medium text-text-primary">When did symptoms start?</p>
              <div className="mt-2 flex gap-2">
                {STARTED_WHEN_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStartedWhen(option)}
                    className={cn(
                      "flex-1 rounded-badge border-[1.5px] py-2.5 text-center font-body text-xs font-medium",
                      startedWhen === option
                        ? "border-primary bg-lilac-light text-lilac-deeper"
                        : "border-border-color bg-white text-text-secondary"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:shadow-card">
              <p className="font-body text-sm font-medium text-text-primary">How severe is it?</p>
              <div className="mt-3 flex gap-2.5">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-card border-[1.5px] p-4 text-center",
                      severity === s.value ? "border-primary bg-lilac-light" : "border-border-color bg-white"
                    )}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <span className="font-heading text-sm font-bold text-text-primary">{s.label}</span>
                    <span className="font-body text-[11px] text-text-secondary">{s.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:shadow-card">
              <p className="font-body text-sm font-medium text-text-primary">Anything else to add?</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe how you're feeling in your own words..."
                rows={4}
                className="mt-3 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-4 font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="h-14 w-full rounded-button bg-lilac-mid font-heading text-[17px] font-bold text-lilac-deeper disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send to my nurse"}
              </button>
              <p className="mt-2.5 text-center font-body text-xs text-[#9CA3AF]">
                Your nurse will review this and reach out if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
