"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmergencyBellIcon } from "@/components/ui/icons";
import EmergencyConfirmSheet from "@/components/ui/EmergencyConfirmSheet";

export default function EmergencyBell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 lg:left-[calc(240px+(100vw-240px)/2)]">
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

      <EmergencyConfirmSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
