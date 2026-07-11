"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmergencyBellIcon } from "@/components/ui/icons";
import BottomSheet from "@/components/ui/BottomSheet";

// Shared confirm/send UI for triggering an emergency alert, used by both the
// floating EmergencyBell and the mother bottom nav's Emergency tab so there's
// one place owning the actual POST /api/emergency call and its states.
export default function EmergencyConfirmSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleConfirm() {
    setSending(true);
    try {
      await fetch("/api/emergency", { method: "POST" });
      setSent(true);
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    onClose();
    setSent(false);
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {sent ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-xl font-bold text-text-primary">Help is on the way</h2>
          <p className="font-body text-sm text-text-secondary">
            Your midwife/nurse has been alerted and will contact you shortly.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-white"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-badge bg-critical-bg">
            <EmergencyBellIcon className="size-7 text-critical" />
          </div>
          <h2 className="font-heading text-xl font-bold text-text-primary">Trigger emergency alert?</h2>
          <p className="font-body text-sm text-text-secondary">
            This will immediately notify your midwife/nurse and emergency contact that you need urgent help.
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={sending}
            className="h-14 w-full rounded-button bg-critical font-heading text-[17px] font-bold text-white disabled:opacity-60"
          >
            {sending ? "Sending…" : "Yes, send alert"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="h-14 w-full rounded-button bg-white font-heading text-[17px] font-bold text-text-secondary"
          >
            Cancel
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
