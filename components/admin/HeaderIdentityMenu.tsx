"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import Avatar from "@/components/ui/Avatar";
import { SettingsIcon } from "@/components/ui/icons";

export default function HeaderIdentityMenu({
  displayName,
  orgName,
  accent,
}: {
  displayName: string;
  orgName: string | null;
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
        <div className="hidden text-right leading-tight lg:block">
          <p className="text-sm font-semibold text-[#1A1A2E]">{displayName}</p>
          {orgName && <p className="text-xs text-[#6B7280]">{orgName}</p>}
        </div>
        <Avatar
          name={displayName}
          size="md"
          background={accent}
          textColor="white"
          textClassName="text-xs font-bold"
        />
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
