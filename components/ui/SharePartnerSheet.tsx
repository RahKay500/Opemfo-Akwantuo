"use client";

import { useEffect, useState } from "react";
import { PartnerIcon } from "@/components/ui/icons";
import BottomSheet from "@/components/ui/BottomSheet";

type LinkState = "loading" | "inactive" | "active";

export default function SharePartnerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<LinkState>("loading");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setState("loading");
    fetch("/api/mother/partner-link")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setUrl(data.url);
          setState("active");
        } else {
          setState("inactive");
        }
      });
  }, [open]);

  async function handleGenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/mother/partner-link", { method: "POST" });
      const data = await res.json();
      setUrl(data.url);
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
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-badge bg-pink-light">
          <PartnerIcon className="size-7 text-pink-deep" />
        </div>
        <h2 className="font-heading text-xl font-bold text-text-primary">Share with your partner</h2>

        {state === "loading" && <p className="font-body text-sm text-text-secondary">Loading…</p>}

        {state === "inactive" && (
          <>
            <p className="font-body text-sm text-text-secondary">
              Generate a private link that lets your partner follow your pregnancy week, progress, and next
              appointment — no account needed on their end.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={busy}
              className="h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-white disabled:opacity-60"
            >
              {busy ? "Generating…" : "Generate link"}
            </button>
          </>
        )}

        {state === "active" && url && (
          <>
            <p className="font-body text-sm text-text-secondary">
              Your partner can view your pregnancy tracker from this link until you revoke it.
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
          </>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="h-14 w-full rounded-button bg-white font-heading text-[17px] font-bold text-text-secondary"
        >
          Close
        </button>
      </div>
    </BottomSheet>
  );
}
