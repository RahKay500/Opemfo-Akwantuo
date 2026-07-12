"use client";

import { useEffect, useState } from "react";
import { PartnerIcon } from "@/components/ui/icons";
import BottomSheet from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";

type LinkState = "loading" | "inactive" | "active";

interface Permissions {
  shareProgress: boolean;
  shareAppointments: boolean;
  shareVitals: boolean;
  shareVisitSummaries: boolean;
  shareReferralStatus: boolean;
  shareMedicalHistory: boolean;
}

const DEFAULT_PERMISSIONS: Permissions = {
  shareProgress: true,
  shareAppointments: true,
  shareVitals: true,
  shareVisitSummaries: true,
  shareReferralStatus: false,
  shareMedicalHistory: false,
};

const PERMISSION_LABELS: { key: keyof Permissions; label: string }[] = [
  { key: "shareProgress", label: "Pregnancy progress & milestones" },
  { key: "shareAppointments", label: "Upcoming appointments" },
  { key: "shareVitals", label: "Baby heart rate & vitals" },
  { key: "shareVisitSummaries", label: "Antenatal visit summaries" },
  { key: "shareReferralStatus", label: "Referral status" },
  { key: "shareMedicalHistory", label: "Medical history & flags" },
];

export default function SharePartnerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<LinkState>("loading");
  const [url, setUrl] = useState<string | null>(null);
  const [activePartnerName, setActivePartnerName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [sendVia, setSendVia] = useState<"sms" | "link">("sms");
  const [permissions, setPermissions] = useState<Permissions>(DEFAULT_PERMISSIONS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setState("loading");
    setError(null);
    fetch("/api/mother/partner-link")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setUrl(data.url);
          setActivePartnerName(data.partnerName ?? null);
          setState("active");
        } else {
          setState("inactive");
        }
      });
  }, [open]);

  async function handleSendInvite() {
    setError(null);
    if (!partnerName.trim() || !partnerPhone.trim()) {
      setError("Enter your partner's name and phone number.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/mother/partner-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName: partnerName.trim(),
          partnerPhone: partnerPhone.trim(),
          sendVia,
          ...permissions,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      const data = await res.json();
      setUrl(data.url);
      setActivePartnerName(partnerName.trim());
      setState("active");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    setBusy(true);
    try {
      await fetch("/api/mother/partner-link", { method: "DELETE" });
      setUrl(null);
      setActivePartnerName(null);
      setPartnerName("");
      setPartnerPhone("");
      setPermissions(DEFAULT_PERMISSIONS);
      setState("inactive");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Follow my pregnancy journey", url });
        return;
      } catch {
        // User cancelled the share sheet — fall through to clipboard copy.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    onClose();
    setCopied(false);
    setError(null);
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="flex size-16 items-center justify-center rounded-badge bg-pink-light">
          <PartnerIcon className="size-7 text-pink-deep" />
        </div>
        <h2 className="font-heading text-xl font-bold text-text-primary">Share with your partner</h2>
      </div>

      {state === "loading" && <p className="mt-4 text-center font-body text-sm text-text-secondary">Loading…</p>}

      {state === "inactive" && (
        <div className="mt-5 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-4">
            <p className="font-body text-sm text-text-secondary">
              Give your partner read-only access to stay informed and involved.
            </p>
            <div>
              <label className="font-body text-[13px] font-medium text-text-secondary">Partner&apos;s name</label>
              <input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Kofi Mensah"
                className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-body text-[13px] font-medium text-text-secondary">Partner&apos;s phone number</label>
              <input
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="024 XXX XXXX"
                className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </div>
            <div className="flex rounded-badge bg-lilac-light p-1">
              {(["sms", "link"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSendVia(v)}
                  className={cn(
                    "flex-1 rounded-badge py-2.5 text-center font-heading text-sm font-bold",
                    sendVia === v ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
                  )}
                >
                  {v === "sms" ? "Send via SMS" : "Copy link"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-body text-[13px] font-medium text-text-secondary">What your partner can see</p>
            <div className="flex flex-col gap-2.5 rounded-card border-[1.5px] border-border-color bg-white p-4">
              {PERMISSION_LABELS.map(({ key, label }, i) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between gap-3 py-1",
                    i < PERMISSION_LABELS.length - 1 && "border-b border-border-color pb-3"
                  )}
                >
                  <p className="font-body text-sm text-text-primary">{label}</p>
                  <button
                    type="button"
                    onClick={() => setPermissions((p) => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      "flex h-6 w-11 shrink-0 items-center rounded-badge px-0.5 transition-colors",
                      permissions[key] ? "bg-primary justify-end" : "bg-border-color justify-start"
                    )}
                  >
                    <span className="size-5 rounded-badge bg-white shadow-card" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-lilac-light p-4 lg:col-span-2">
            <p className="font-body text-xs text-lilac-deeper">
              Your partner gets <span className="font-semibold">read-only</span> access. They cannot edit records,
              contact your nurse, or create referrals. Revoke anytime from Profile → Privacy Settings.
            </p>
          </div>

          {error && <p className="font-body text-sm text-[#DC2626] lg:col-span-2">{error}</p>}

          <button
            type="button"
            onClick={handleSendInvite}
            disabled={busy}
            className="h-14 w-full rounded-button bg-pink-deep font-heading text-[17px] font-bold text-white disabled:opacity-60 lg:col-span-2"
          >
            {busy ? "Sending…" : "Send invite"}
          </button>
        </div>
      )}

      {state === "active" && url && (
        <div className="mt-5 flex flex-col items-center gap-4 text-center">
          <p className="font-body text-sm text-text-secondary">
            {activePartnerName ? (
              <>
                <span className="font-medium text-text-primary">{activePartnerName}</span> can view your pregnancy
                tracker from this link until you revoke it.
              </>
            ) : (
              "Your partner can view your pregnancy tracker from this link until you revoke it."
            )}
          </p>
          <div className="w-full break-all rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-xs text-text-secondary">
            {url}
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-white"
          >
            {copied ? "Copied!" : "Share link"}
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={busy}
            className="h-14 w-full rounded-button bg-white font-heading text-[17px] font-bold text-[#DC2626] disabled:opacity-60"
          >
            {busy ? "Revoking…" : "Revoke access"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleClose}
        className="mt-4 h-14 w-full rounded-button bg-white font-heading text-[17px] font-bold text-text-secondary"
      >
        Close
      </button>
    </BottomSheet>
  );
}
