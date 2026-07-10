"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavRecordsIcon, NavReferralIcon, NavProfileIcon, EmergencyBellIcon } from "@/components/ui/icons";
import EmergencyConfirmSheet from "@/components/ui/EmergencyConfirmSheet";

const NAV_ITEMS = [
  { href: "/mother/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/mother/records", label: "Records", icon: NavRecordsIcon },
  { href: "/mother/referral", label: "Referral", icon: NavReferralIcon },
];

export default function MotherSidebar() {
  const pathname = usePathname();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const profileActive = pathname === "/mother/profile";

  return (
    <>
      <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border-color bg-white">
        <div className="px-6 pb-6 pt-8">
          <p className="font-heading text-lg font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
          <p className="mt-1 text-xs font-medium text-lilac-dark">Mother</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
                  active ? "bg-lilac-light text-lilac-dark" : "text-text-secondary hover:bg-lilac-light/50"
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className="flex items-center gap-3 rounded-input px-4 py-2.5 text-left font-body text-sm font-medium text-critical hover:bg-critical-bg"
          >
            <EmergencyBellIcon className="size-5" />
            Emergency
          </button>

          <Link
            href="/mother/profile"
            className={cn(
              "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
              profileActive ? "bg-lilac-light text-lilac-dark" : "text-text-secondary hover:bg-lilac-light/50"
            )}
          >
            <NavProfileIcon className="size-5" />
            Profile
          </Link>
        </nav>
      </aside>

      <EmergencyConfirmSheet open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  );
}
