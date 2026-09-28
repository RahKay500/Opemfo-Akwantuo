"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatDate } from "@/lib/utils";
import { SearchIcon } from "@/components/ui/icons";
import Tabs from "@/components/ui/Tabs";
import BottomSheet from "@/components/ui/BottomSheet";
import type { LabRequestQueueItem } from "@/lib/queries/lab-request-queue";
import type { LabRequestStatus } from "@prisma/client";

const FILTERS = ["Pending", "In Progress", "Ready", "Cancelled", "All"] as const;

const STATUS_STYLE: Record<LabRequestStatus, { bg: string; text: string; label: string }> = {
  REQUESTED: { bg: "bg-lilac-light", text: "text-lilac-deeper", label: "Requested" },
  IN_PROGRESS: { bg: "bg-high-bg", text: "text-high", label: "In Progress" },
  READY: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Ready" },
  CANCELLED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Cancelled" },
};

function matchesFilter(status: LabRequestStatus, filter: (typeof FILTERS)[number]): boolean {
  if (filter === "All") return true;
  if (filter === "Pending") return status === "REQUESTED";
  if (filter === "In Progress") return status === "IN_PROGRESS";
  if (filter === "Ready") return status === "READY";
  return status === "CANCELLED";
}

export default function LabQueueClient({ requests }: { requests: LabRequestQueueItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Pending");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = requests.filter((r) => {
    if (query && !r.patientName.toLowerCase().includes(query.toLowerCase())) return false;
    return matchesFilter(r.status, filter);
  });

  const active = requests.find((r) => r.id === activeId) ?? null;

  return (
    <>
      <div className="px-5 pt-5">
        <div className="flex h-[52px] items-center gap-2.5 rounded-input bg-white px-4 shadow-[0px_4px_8px_rgba(0,0,0,0.08)] lg:border lg:border-border-color lg:shadow-none">
          <SearchIcon className="size-[18px] text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name..."
            className="flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <Tabs
        style="pill"
        className="px-5 pb-1 pt-4"
        tabs={FILTERS.map((f) => ({ key: f, label: f }))}
        activeKey={filter}
        onChange={(key) => setFilter(key as (typeof FILTERS)[number])}
      />

      <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary">No lab requests match this filter.</p>
        )}
        {filtered.map((r) => {
          const style = STATUS_STYLE[r.status];
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveId(r.id)}
              className="rounded-card border border-border-color bg-white py-4 pl-5 pr-4 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="font-heading text-base font-bold text-text-primary">{r.patientName}</p>
                <span className={cn("rounded-badge px-2.5 py-1 font-body text-xs font-medium", style.bg, style.text)}>
                  {style.label}
                </span>
              </div>
              <p className="mt-1.5 font-body text-[13px] text-text-primary">{r.testType}</p>
              <p className="mt-1 font-body text-xs text-text-secondary">
                Requested by {r.requestedByName} ({r.requestedByRole}) · {formatDate(r.requestedAt)}
              </p>
              {r.eta && r.status === "IN_PROGRESS" && (
                <p className="mt-1 font-body text-xs text-high">ETA: {r.eta}</p>
              )}
            </button>
          );
        })}
      </div>

      <LabRequestActionSheet request={active} onClose={() => setActiveId(null)} onDone={() => router.refresh()} />
    </>
  );
}

function LabRequestActionSheet({
  request,
  onClose,
  onDone,
}: {
  request: LabRequestQueueItem | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [eta, setEta] = useState("");
  const [result, setResult] = useState("");
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEta("");
    setResult("");
    setIsAbnormal(false);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function submit(status: "IN_PROGRESS" | "READY" | "CANCELLED", body: Record<string, unknown> = {}) {
    if (!request) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/lab-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      reset();
      onClose();
      onDone();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={Boolean(request)} onClose={handleClose}>
      {request && (
        <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
        <div>
          <p className="font-heading text-lg font-bold text-text-primary">{request.patientName}</p>
          <p className="mt-0.5 font-body text-sm text-text-secondary">{request.testType}</p>
          {request.notes && <p className="mt-1 font-body text-xs text-text-secondary">Notes: {request.notes}</p>}
        </div>

        {request.status === "REQUESTED" && (
          <>
            <div>
              <label className="font-body text-sm font-medium text-text-primary">ETA (optional)</label>
              <input
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="e.g. Ready in 20 min"
                className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
            {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => submit("CANCELLED")}
                disabled={submitting}
                className="h-12 flex-1 rounded-button border-[1.5px] border-[#DC2626] font-heading text-sm font-bold text-[#DC2626] disabled:opacity-60"
              >
                Cancel Request
              </button>
              <button
                type="button"
                onClick={() => submit("IN_PROGRESS", { eta: eta.trim() || undefined })}
                disabled={submitting}
                className="h-12 flex-1 rounded-button bg-primary font-heading text-sm font-bold text-white disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Start Test"}
              </button>
            </div>
          </>
        )}

        {request.status === "IN_PROGRESS" && (
          <>
            <div>
              <label className="font-body text-sm font-medium text-text-primary">Result</label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                rows={3}
                placeholder="e.g. Negative"
                className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={isAbnormal}
                onChange={(e) => setIsAbnormal(e.target.checked)}
                className="size-4 rounded border-border-color"
              />
              <span className="font-body text-sm text-text-primary">Flag as abnormal result</span>
            </label>
            {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => submit("CANCELLED")}
                disabled={submitting}
                className="h-12 flex-1 rounded-button border-[1.5px] border-[#DC2626] font-heading text-sm font-bold text-[#DC2626] disabled:opacity-60"
              >
                Cancel Request
              </button>
              <button
                type="button"
                onClick={() => submit("READY", { result: result.trim() || undefined, isAbnormal })}
                disabled={submitting || !result.trim()}
                className="h-12 flex-1 rounded-button bg-primary font-heading text-sm font-bold text-white disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Mark Ready"}
              </button>
            </div>
          </>
        )}

        {(request.status === "READY" || request.status === "CANCELLED") && (
          <>
            {request.status === "READY" && (
              <div className="rounded-card bg-[#F8FAFC] p-3.5">
                <p className="font-body text-xs font-medium text-text-secondary">Result</p>
                <p className="mt-1 font-body text-sm text-text-primary">{request.result}</p>
                {request.isAbnormal && <p className="mt-1.5 font-body text-xs font-bold text-critical">Flagged abnormal</p>}
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="h-12 w-full rounded-button border-[1.5px] border-border-color font-heading text-sm font-bold text-text-primary"
            >
              Close
            </button>
          </>
        )}
        </div>
      )}
    </BottomSheet>
  );
}
