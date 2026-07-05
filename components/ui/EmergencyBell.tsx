"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EmergencyBellIcon } from "@/components/ui/icons";
import BottomSheet from "@/components/ui/BottomSheet";

export default function EmergencyBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    setSent(false);
  }

  return (
    <>
      <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2">
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-badge bg-critical/60"
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Trigger emergency alert"
          className="relative flex size-[70px] items-center justify-center rounded-badge bg-critical shadow-[0px_4px_8px_rgba(220,38,38,0.35)]"
        >
          <EmergencyBellIcon className="size-7 text-white" />
        </button>
      </div>

      <BottomSheet open={open} onClose={handleClose}>
        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-heading text-xl font-bold text-text-primary">Help is on the way</h2>
            <p className="font-body text-sm text-text-secondary">
              Your midwife has been alerted and will contact you shortly.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-lilac-deeper"
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
              This will immediately notify your midwife and emergency contact that you need urgent help.
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
    </>
  );
}
