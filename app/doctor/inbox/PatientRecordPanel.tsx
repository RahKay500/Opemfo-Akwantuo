"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { THRESHOLDS } from "@/lib/flagging";
import { ShareIcon, NavRecordsIcon, CheckIcon, XIcon } from "@/components/ui/icons";
import BPGraphLoader from "@/components/ui/BPGraphLoader";
import type { BPGraphPoint } from "@/components/ui/BPGraph";
import type { DoctorInboxStatus } from "@/lib/queries/doctor-inbox";
import type { DoctorDirectoryEntry } from "@/lib/queries/doctor-directory";

function sharedLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const datePart = isToday ? "Today" : formatDate(d);
  const timePart = d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} · ${timePart}`;
}

export interface LatestVitals {
  systolic: number | null;
  diastolic: number | null;
  weight: number | null;
  fetalHeartRate: number | null;
}

export default function PatientRecordPanel({
  shareId,
  patientName,
  sharedByName,
  facilityName,
  reason,
  doctorNotes: initialDoctorNotes,
  createdAt,
  status,
  bpTrend,
  latestVitals,
  otherDoctors,
}: {
  shareId: string;
  patientName: string;
  sharedByName: string;
  facilityName: string;
  reason: string | null;
  doctorNotes: string | null;
  createdAt: string;
  status: DoctorInboxStatus;
  bpTrend: BPGraphPoint[];
  latestVitals: LatestVitals | null;
  otherDoctors: DoctorDirectoryEntry[];
}) {
  const router = useRouter();
  const [doctorNotes, setDoctorNotes] = useState(initialDoctorNotes);
  const [reviewing, setReviewing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showForward, setShowForward] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  async function handleMarkReviewed() {
    setReviewing(true);
    try {
      const res = await fetch(`/api/referral-shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markReviewed: true }),
      });
      if (res.ok) {
        setCurrentStatus("Reviewed");
        router.refresh();
      }
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      <div className="flex items-start justify-between rounded-card bg-white p-6 shadow-card">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">{patientName}</h1>
          <p className="mt-1.5 font-body text-sm text-text-secondary">
            Shared by {sharedByName} · {facilityName}
          </p>
          <p className="mt-0.5 font-body text-sm text-text-secondary">{sharedLabel(createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForward(true)}
            className="flex items-center gap-1.5 rounded-input bg-lilac-light px-4 py-2.5 font-heading text-sm font-bold text-lilac-deeper"
          >
            <ShareIcon className="size-4" />
            Forward
          </button>
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="flex items-center gap-1.5 rounded-input bg-lilac-mid px-4 py-2.5 font-heading text-sm font-bold text-lilac-deeper"
          >
            <NavRecordsIcon className="size-4" />
            Add Notes
          </button>
        </div>
      </div>

      {reason && (
        <div className="rounded-card bg-pink-light p-5">
          <p className="font-body text-sm font-bold text-pink-deep">Midwife&apos;s Note</p>
          <p className="mt-1.5 font-body text-[15px] text-text-primary">{reason}</p>
        </div>
      )}

      {doctorNotes && (
        <div className="rounded-card bg-lilac-light p-5">
          <p className="font-body text-sm font-bold text-lilac-deeper">Your Note</p>
          <p className="mt-1.5 font-body text-[15px] text-text-primary">{doctorNotes}</p>
        </div>
      )}

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-heading text-lg font-bold text-text-primary">Blood Pressure Trend</h2>
        <p className="mt-0.5 font-body text-sm text-text-secondary">Last 6 antenatal visits</p>
        {bpTrend.length > 0 ? (
          <>
            <div className="mt-4">
              <BPGraphLoader data={bpTrend} showThreshold={false} systolicColor="#DC2626" diastolicColor="#E4A8F3" />
            </div>
            <div className="mt-3 flex items-center gap-5">
              <span className="flex items-center gap-1.5 font-body text-sm text-text-secondary">
                <span className="h-[3px] w-4 rounded-full bg-[#DC2626]" /> Systolic
              </span>
              <span className="flex items-center gap-1.5 font-body text-sm text-text-secondary">
                <span className="h-[3px] w-4 rounded-full bg-lilac-mid" /> Diastolic
              </span>
            </div>
          </>
        ) : (
          <p className="mt-4 font-body text-sm text-text-secondary">No BP readings recorded yet.</p>
        )}
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <h2 className="font-heading text-lg font-bold text-text-primary">Latest Vitals</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <VitalTile
            label="Systolic BP"
            value={latestVitals?.systolic != null ? `${latestVitals.systolic} mmHg` : "—"}
            above={latestVitals?.systolic != null && latestVitals.systolic >= THRESHOLDS.systolic.high}
          />
          <VitalTile
            label="Diastolic BP"
            value={latestVitals?.diastolic != null ? `${latestVitals.diastolic} mmHg` : "—"}
            above={latestVitals?.diastolic != null && latestVitals.diastolic >= THRESHOLDS.diastolic.high}
          />
          <VitalTile label="Weight" value={latestVitals?.weight != null ? `${latestVitals.weight} kg` : "—"} />
          <VitalTile
            label="Fetal HR"
            value={latestVitals?.fetalHeartRate != null ? `${latestVitals.fetalHeartRate} bpm` : "—"}
          />
        </div>
      </div>

      {currentStatus === "Active" && (
        <button
          type="button"
          onClick={handleMarkReviewed}
          disabled={reviewing}
          className="flex h-14 items-center justify-center gap-2 rounded-card bg-lilac-mid font-heading text-base font-bold text-lilac-deeper disabled:opacity-60"
        >
          <CheckIcon className="size-5" />
          {reviewing ? "Saving…" : "Mark as Reviewed"}
        </button>
      )}

      {showForward && (
        <ForwardModal shareId={shareId} otherDoctors={otherDoctors} onClose={() => setShowForward(false)} />
      )}
      {showNotes && (
        <NotesModal
          shareId={shareId}
          initialValue={doctorNotes ?? ""}
          onClose={() => setShowNotes(false)}
          onSaved={(value) => {
            setDoctorNotes(value);
            setShowNotes(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function VitalTile({ label, value, above }: { label: string; value: string; above?: boolean }) {
  return (
    <div className={`rounded-card p-4 ${above ? "bg-critical-bg" : "bg-[#F9FAFB]"}`}>
      <p className={`font-body text-sm ${above ? "text-critical" : "text-text-secondary"}`}>{label}</p>
      <p className={`mt-1.5 font-heading text-xl font-bold ${above ? "text-critical" : "text-text-primary"}`}>{value}</p>
      {above && <p className="mt-1 font-body text-xs font-medium text-critical">Above threshold</p>}
    </div>
  );
}

function ForwardModal({
  shareId,
  otherDoctors,
  onClose,
}: {
  shareId: string;
  otherDoctors: DoctorDirectoryEntry[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(otherDoctors[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!doctorId) {
      setError("Choose a doctor to forward to.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/referral-shares/${shareId}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, reason: reason.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-text-primary">Forward Record</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon className="size-5 text-text-secondary" />
          </button>
        </div>

        {otherDoctors.length === 0 ? (
          <p className="mt-4 font-body text-sm text-text-secondary">No other doctors are available to forward to yet.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-2">
              <label className="font-body text-sm font-medium text-text-secondary">Forward to</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              >
                {otherDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.facilityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label className="font-body text-sm font-medium text-text-secondary">Note (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Add context for the receiving doctor..."
                className="w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            {error && <p className="mt-3 font-body text-sm text-[#DC2626]">{error}</p>}

            <button
              type="button"
              onClick={handleSend}
              disabled={submitting}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-input bg-lilac-dark font-heading text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NotesModal({
  shareId,
  initialValue,
  onClose,
  onSaved,
}: {
  shareId: string;
  initialValue: string;
  onClose: () => void;
  onSaved: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/referral-shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorNotes: value.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      onSaved(value.trim());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-text-primary">Add Notes</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <XIcon className="size-5 text-text-secondary" />
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder="Add your clinical notes on this record..."
          className="mt-4 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
        />
        {error && <p className="mt-3 font-body text-sm text-[#DC2626]">{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-input bg-lilac-dark font-heading text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Note"}
        </button>
      </div>
    </div>
  );
}
