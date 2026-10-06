"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PartnerIcon } from "@/components/ui/icons";
import { cn, digitsOnly, lettersOnly } from "@/lib/utils";
import Toggle from "@/components/ui/Toggle";
import Input from "@/components/ui/Input";

type LinkState = "loading" | "inactive" | "pending" | "active";

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

export default function SharePartnerForm() {
  const router = useRouter();
  const [state, setState] = useState<LinkState>("loading");
  const [activePartnerName, setActivePartnerName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [permissions, setPermissions] = useState<Permissions>(DEFAULT_PERMISSIONS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mother/partner-link")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setActivePartnerName(data.partnerName ?? null);
          setState(data.partnerActivated ? "active" : "pending");
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
          ...permissions,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      const data = await res.json();
      setActivePartnerName(partnerName.trim());
      setState(data.partnerActivated ? "active" : "pending");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    setBusy(true);
    try {
      await fetch("/api/mother/partner-link", { method: "DELETE" });
      setActivePartnerName(null);
      setPartnerName("");
      setPartnerPhone("");
      setPermissions(DEFAULT_PERMISSIONS);
      setState("inactive");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") {
    return <p className="px-5 py-8 text-center font-body text-sm text-text-secondary">Loading…</p>;
  }

  if (state === "pending" || state === "active") {
    return (
      <div className="flex flex-col items-center gap-4 px-5 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-badge bg-pink-light">
          <PartnerIcon className="size-6 text-pink-deep" />
        </div>
        <p className="font-body text-sm text-text-secondary">
          {state === "pending" ? (
            <>
              We texted <span className="font-medium text-text-primary">{activePartnerName}</span> — they&apos;ll be
              able to view your pregnancy tracker once they activate their account.
            </>
          ) : (
            <>
              <span className="font-medium text-text-primary">{activePartnerName}</span> has access to your
              pregnancy tracker.
            </>
          )}
        </p>
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
      <div className="rounded-card bg-white p-6 border border-border-color">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-pink-light">
            <PartnerIcon className="size-5 text-pink-deep" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-text-primary">Invite your partner</h2>
            <p className="mt-0.5 font-body text-[13px] text-text-secondary">
              Give your partner their own read-only login to stay informed and involved.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="font-body text-[13px] font-medium text-text-secondary">Partner&apos;s name</label>
          <Input
            inputSize="lg"
            value={partnerName}
            onChange={(e) => setPartnerName(lettersOnly(e.target.value))}
            placeholder="e.g. Kofi Mensah"
            className="mt-1.5"
          />
        </div>

        <div className="mt-4">
          <label className="font-body text-[13px] font-medium text-text-secondary">Partner&apos;s phone number</label>
          <Input
            inputSize="lg"
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(digitsOnly(e.target.value))}
            placeholder="024 XXX XXXX"
            className="mt-1.5"
            inputMode="numeric"
          />
          <p className="mt-1.5 font-body text-xs text-text-secondary">
            We&apos;ll text them to activate their own account with this number.
          </p>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 border border-border-color">
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
              <Toggle
                checked={permissions[key]}
                onChange={() => setPermissions((p) => ({ ...p, [key]: !p[key] }))}
                size="md"
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-lilac-light p-4 lg:col-span-2">
        <p className="font-body text-xs text-lilac-deeper">
          <span className="font-semibold">✓ Your partner gets read-only access.</span> They cannot edit records,
          contact your midwife, or create referrals. Revoke anytime from this screen.
        </p>
      </div>

      {error && <p className="font-body text-sm text-[#DC2626] lg:col-span-2">{error}</p>}

      <button
        type="button"
        onClick={handleSendInvite}
        disabled={busy}
        className="h-14 w-full rounded-button bg-pink-accent font-heading text-[17px] font-bold text-white disabled:opacity-60 lg:col-span-2 lg:mx-auto lg:w-1/2"
      >
        {busy ? "Sending…" : "Send invite"}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        className="h-12 w-full rounded-button bg-white font-body text-sm font-medium text-text-secondary lg:col-span-2 lg:mx-auto lg:w-1/2"
      >
        Cancel
      </button>
    </div>
  );
}
