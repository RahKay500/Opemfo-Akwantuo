"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Avatar, { type AvatarSize } from "@/components/ui/Avatar";
import LogoutButton from "@/components/ui/LogoutButton";

// Same card this app already used inside each portal's Sidebar (avatar +
// name + facility/role subtitle) — moved here instead of a new, slimmer
// design, so the top-right identity menu is the sidebar card relocated,
// not a different-looking element.
export default function IdentityMenu({
  name,
  subtitle,
  profileHref,
  avatarSize = "md",
  variant = "dark",
}: {
  name: string;
  subtitle?: string | null;
  profileHref: string;
  avatarSize?: AvatarSize;
  variant?: "dark" | "light";
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
        className={cn(
          "flex items-center gap-2.5 rounded-card px-3 py-3",
          variant === "dark" ? "bg-[#27273A]" : "bg-surface"
        )}
      >
        <Avatar name={name} size={avatarSize} background="#eeaafd" textColor="#821890" textClassName="text-xs font-bold" />
        <div className="min-w-0 text-left">
          <p className={cn("truncate font-body text-sm font-medium", variant === "dark" ? "text-white" : "text-text-primary")}>
            {name}
          </p>
          {subtitle && (
            <p className={cn("truncate font-body text-xs", variant === "dark" ? "text-[#8A8AA3]" : "text-text-secondary")}>
              {subtitle}
            </p>
          )}
        </div>
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
