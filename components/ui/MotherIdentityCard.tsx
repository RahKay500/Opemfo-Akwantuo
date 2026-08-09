"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/ui/LogoutButton";

// The pregnancy-progress card that used to live at the top of MotherSidebar
// — moved here (top-right) instead of a redesign, with a click-to-open
// Profile/Sign out dropdown added on top.
export default function MotherIdentityCard({
  name,
  week,
  dueDate,
  progressPercent,
}: {
  name: string;
  week: number | null;
  dueDate: string | null;
  progressPercent: number | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative w-72">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-card bg-surface p-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-badge bg-lilac-light">
            <Image src="/images/logo.png" alt="" width={18} height={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-body text-sm font-medium text-text-primary">{name}</p>
            {week != null && (
              <p className="truncate font-body text-xs text-text-secondary">
                Week {week}
                {dueDate
                  ? ` · Due ${new Date(dueDate).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}`
                  : ""}
              </p>
            )}
          </div>
        </div>
        {progressPercent != null && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[11px] text-text-secondary">Pregnancy progress</p>
              <p className="font-body text-[11px] font-bold text-text-primary">{progressPercent}%</p>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-badge bg-lilac-light">
              <div className="h-full rounded-badge bg-lilac-dark" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full z-10 mt-1 w-44 rounded-card border border-border-color bg-white py-1 shadow-lg"
        >
          <Link
            href="/mother/profile"
            className="block px-3.5 py-2 font-body text-sm font-medium text-text-primary hover:bg-[#F8FAFC]"
          >
            Profile
          </Link>
          <LogoutButton variant="menu-item" />
        </div>
      )}
    </div>
  );
}
