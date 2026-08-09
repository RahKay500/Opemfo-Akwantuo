"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import Avatar from "@/components/ui/Avatar";
import { SettingsIcon } from "@/components/ui/icons";

export default function HeaderIdentityMenu({
  displayName,
  orgName,
  tierLabel,
  accent,
}: {
  displayName: string;
  orgName: string | null;
  tierLabel: string;
  accent: string;
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white/60 px-3 py-2 backdrop-blur-md transition-colors hover:bg-white/80"
      >
        <Avatar
          name={displayName}
          size="md"
          background={accent}
          textColor="white"
          textClassName="text-xs font-bold"
        />
        <div className="hidden text-left leading-tight lg:block">
          <p className="text-sm font-semibold text-[#1A1A2E]">{displayName}</p>
          {orgName && <p className="mt-0.5 text-xs text-[#6B7280]">{orgName}</p>}
          <span
            className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: `${accent}1A`, color: accent }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-3 shrink-0">
              <path
                fillRule="evenodd"
                d="M10 1.75a1 1 0 01.447.106l6 3A1 1 0 0117 5.75v4.5c0 4.03-2.611 7.437-6.435 8.61a1 1 0 01-.63 0C6.111 17.687 3.5 14.28 3.5 10.25v-4.5a1 1 0 01.553-.894l6-3A1 1 0 0110 1.75z"
                clipRule="evenodd"
              />
            </svg>
            {tierLabel}
          </span>
        </div>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-[#E2E8F0] bg-white py-1 shadow-lg"
        >
          <Link
            href="/admin/settings"
            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-[#1A1A2E] hover:bg-[#F8FAFC]"
          >
            <SettingsIcon className="size-4" />
            Profile Settings
          </Link>
          <AdminSignOutButton />
        </div>
      )}
    </div>
  );
}
