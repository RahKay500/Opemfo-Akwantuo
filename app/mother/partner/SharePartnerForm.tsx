"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PartnerIcon } from "@/components/ui/icons";
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

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-6 w-11 shrink-0 items-center rounded-badge px-0.5 transition-colors",
        on ? "justify-end bg-[#E4A8F3]" : "justify-start bg-border-color"
      )}
    >
      <span className={cn("size-5 rounded-badge", on ? "bg-[#6A1F8A]" : "bg-[#9CA3AF]")} />
    </button>
  );
}

export default function SharePartnerForm() {
  const router = useRouter();
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
  }, []);

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

  if (state === "loading") {
    return <p className="px-5 py-8 text-center font-body text-sm text-text-secondary">Loading…</p>;
  }

  if (state === "active" && url) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 py-8 text-center">
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
        <div className="w-full max-w-md break-all rounded-input border-[1.5px] border-border-color bg-white p-3.5 font-body text-xs text-text-secondary">
          {url}
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="h-14 w-full max-w-md rounded-button bg-primary font-heading text-[17px] font-bold text-white"
        >
          {copied ? "Copied!" : "Share link"}
        </button>
        <button
          type="button"
          onClick={handleRevoke}
          disabled={busy}
          className="h-14 w-full max-w-md rounded-button bg-white font-heading text-[17px] font-bold text-[#DC2626] disabled:opacity-60"
        >
          {busy ? "Revoking…" : "Revoke access"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <div className="rounded-card bg-white p-6 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-pink-light">
            <PartnerIcon className="size-5 text-pink-deep" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-text-primary">Invite your partner</h2>
            <p className="mt-0.5 font-body text-[13px] text-text-secondary">
              Give your partner read-only access to stay informed and involved.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="font-body text-[13px] font-medium text-text-secondary">Partner&apos;s name</label>
          <input
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="e.g. Kofi Mensah"
            className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </div>

        <div className="mt-4 flex rounded-badge bg-lilac-light p-1">
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

        <div className="mt-4">
          <label className="font-body text-[13px] font-medium text-text-secondary">Partner&apos;s phone number</label>
          <input
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(e.target.value)}
            placeholder="024 XXX XXXX"
            className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card">
        <p className="font-heading text-base font-bold text-text-primary">What your partner can see</p>
        <div className="mt-4 flex flex-col">
          {PERMISSION_LABELS.map(({ key, label }, i) => (
            <div
              key={key}
              className={cn(
                "flex items-center justify-between gap-3 py-3.5",
                i < PERMISSION_LABELS.length - 1 && "border-b border-border-color"
              )}
            >
              <p className="font-body text-sm text-text-primary">{label}</p>
              <Toggle on={permissions[key]} onClick={() => setPermissions((p) => ({ ...p, [key]: !p[key] }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-lilac-light p-4 lg:col-span-2">
        <p className="font-body text-xs text-lilac-deeper">
          <span className="font-semibold">✓ Your partner gets read-only access.</span> They cannot edit records,
          contact your nurse, or create referrals. Revoke anytime from Profile → Privacy Settings.
        </p>
      </div>

      {error && <p className="font-body text-sm text-[#DC2626] lg:col-span-2">{error}</p>}

      <button
        type="button"
        onClick={handleSendInvite}
        disabled={busy}
        className="h-14 w-full rounded-button bg-pink-accent font-heading text-[17px] font-bold text-white disabled:opacity-60 lg:col-span-2 lg:mx-auto lg:w-auto lg:px-16"
      >
        {busy ? "Sending…" : "Send invite"}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        className="h-12 w-full rounded-button bg-white font-body text-sm font-medium text-text-secondary lg:col-span-2 lg:mx-auto lg:w-auto lg:px-16"
      >
        Cancel
      </button>
    </div>
  );
}
