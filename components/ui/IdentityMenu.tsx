"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { initials } from "@/lib/utils";
import LogoutButton from "@/components/ui/LogoutButton";

export default function IdentityMenu({ name, profileHref }: { name: string; profileHref: string }) {
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
        className="flex items-center gap-2 rounded-badge border border-border-color bg-white px-2 py-1.5 pr-3"
      >
        <div className="flex size-8 items-center justify-center rounded-badge bg-lilac-light">
          <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(name)}</span>
        </div>
        <span className="font-body text-sm font-medium text-text-primary">{name}</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full z-10 mt-1 w-44 rounded-card border border-border-color bg-white py-1 shadow-lg"
        >
          <Link
            href={profileHref}
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
