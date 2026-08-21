"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import SymptomChip from "@/components/ui/SymptomChip";
import Button from "@/components/ui/Button";
import BottomSheet from "@/components/ui/BottomSheet";

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

interface SymptomReport {
  id: string;
  symptoms: string[];
  severity: "MILD" | "MODERATE" | "SEVERE";
  notes: string | null;
  startedWhen: string | null;
  createdAt: string;
  reviewedByNurseId: string | null;
  cancelledAt: string | null;
}

const SEVERITY_LABEL: Record<SymptomReport["severity"], string> = { MILD: "Mild", MODERATE: "Moderate", SEVERE: "Severe" };

export default function MotherSymptomsPage() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"MILD" | "MODERATE" | "SEVERE" | null>(null);
  const [notes, setNotes] = useState("");
  const [startedWhen, setStartedWhen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SymptomReport | null>(null);
  const [cancelling, setCancelling] = useState(false);

  function loadReports() {
    fetch("/api/symptoms")
      .then((res) => res.json())
      .then((data) => setReports(data.symptoms ?? []))
      .catch(() => {});
  }

  useEffect(loadReports, []);

  function resetForm() {
    setSelectedSymptoms([]);
    setSeverity(null);
    setNotes("");
    setStartedWhen(null);
    setEditingId(null);
    setError(null);
  }

  function startEdit(report: SymptomReport) {
    setSelectedSymptoms(report.symptoms);
    setSeverity(report.severity);
    setNotes(report.notes ?? "");
    setStartedWhen(report.startedWhen);
    setEditingId(report.id);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
      const res = await fetch(editingId ? `/api/symptoms/${editingId}` : "/api/symptoms", {
        method: editingId ? "PATCH" : "POST",
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
      if (editingId) {
        resetForm();
        loadReports();
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/symptoms/${cancelTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setCancelTarget(null);
        loadReports();
      }
    } finally {
      setCancelling(false);
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
        <Button size="cta" shape="rect" onClick={() => router.push("/mother/dashboard")} className="mt-2">
          Back to Dashboard
        </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:mx-5 lg:mt-8 lg:rounded-card lg:bg-white lg:px-6 lg:py-5 lg:pb-5 lg:pt-5 lg:text-left lg:border border-border-color">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">How are you feeling?</h1>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-5">
        <div className="rounded-card bg-lilac-light p-4">
          <p className="font-body text-sm text-lilac-deeper">
            {editingId
              ? "Editing a report you already sent — your nurse will see the updated version."
              : "Tell your nurse how you're feeling. This helps them monitor your health between visits."}
          </p>
        </div>

        {/* Each column is its own independent-height flex stack (not shared grid
            rows) so a short right-column card doesn't inherit empty space from
            a taller left-column card in the same row. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-6">
          <div className="flex flex-col gap-6">
            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:border border-border-color">
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

            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:border border-border-color">
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
            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:border border-border-color">
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

            <div className="lg:rounded-card lg:bg-white lg:p-5 lg:border border-border-color">
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
              <div className="flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-14 w-1/3 rounded-button border-[1.5px] border-border-color font-heading text-[15px] font-bold text-text-secondary"
                  >
                    Cancel edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="h-14 flex-1 rounded-button bg-lilac-mid font-heading text-[17px] font-bold text-lilac-deeper disabled:opacity-60"
                >
                  {submitting ? "Saving…" : editingId ? "Update report" : "Send to my nurse"}
                </button>
              </div>
              <p className="mt-2.5 text-center font-body text-xs text-[#9CA3AF]">
                Your nurse will review this and reach out if needed.
              </p>
            </div>
          </div>
        </div>

        {reports.length > 0 && (
          <div>
            <h2 className="font-heading text-[17px] font-bold text-text-primary">My Reports</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {reports.map((report) => {
                const editable = !report.cancelledAt && !report.reviewedByNurseId;
                const status = report.cancelledAt ? "Cancelled" : report.reviewedByNurseId ? "Reviewed" : "Pending review";
                return (
                  <div key={report.id} className="rounded-card bg-white p-4 border border-border-color">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-sm font-bold text-text-primary">
                          {SEVERITY_LABEL[report.severity]} · {report.symptoms.join(", ") || "No symptoms selected"}
                        </p>
                        <p className="mt-1 font-body text-xs text-text-secondary">{formatRelativeTime(report.createdAt)}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-badge px-2.5 py-1 font-body text-[11px] font-medium",
                          report.cancelledAt
                            ? "bg-[#F3F4F6] text-[#6B7280]"
                            : report.reviewedByNurseId
                              ? "bg-[#F0FDF4] text-[#16A34A]"
                              : "bg-lilac-light text-lilac-deeper"
                        )}
                      >
                        {status}
                      </span>
                    </div>
                    {report.notes && <p className="mt-2 font-body text-xs text-text-secondary">{report.notes}</p>}
                    {editable && (
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(report)}
                          className="font-body text-xs font-medium text-pink-deep"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelTarget(report)}
                          className="font-body text-xs font-medium text-[#DC2626]"
                        >
                          Cancel report
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomSheet open={cancelTarget != null} onClose={() => setCancelTarget(null)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-xl font-bold text-text-primary">Cancel this report?</h2>
          <p className="font-body text-sm text-text-secondary">
            Your nurse will be notified that this report was cancelled.
          </p>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            className="h-14 w-full rounded-button bg-[#DC2626] font-heading text-[17px] font-bold text-white disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Yes, cancel report"}
          </button>
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            className="h-14 w-full rounded-button bg-white font-body text-sm font-medium text-text-secondary"
          >
            Keep report
          </button>
        </div>
      </BottomSheet>
    </main>
  );
}
