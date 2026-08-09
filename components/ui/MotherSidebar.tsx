"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  NavHomeIcon,
  NavRecordsIcon,
  NavReferralIcon,
  AlertTriangleIcon,
  CalendarIcon,
  PlayIcon,
  NavAlertsIcon,
  PartnerIcon,
  NavProfileIcon,
} from "@/components/ui/icons";
import EmergencyConfirmSheet from "@/components/ui/EmergencyConfirmSheet";

const NAV_ITEMS = [
  { href: "/mother/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/mother/records", label: "My Records", icon: NavRecordsIcon },
  { href: "/mother/referral", label: "Referral Status", icon: NavReferralIcon },
  { href: "/mother/symptoms", label: "Report Symptoms", icon: AlertTriangleIcon },
  { href: "/mother/book", label: "Book a Visit", icon: CalendarIcon },
  { href: "/mother/videos", label: "Learn & Prepare", icon: PlayIcon },
  { href: "/mother/notifications", label: "Alerts", icon: NavAlertsIcon },
  { href: "/mother/profile", label: "Profile", icon: NavProfileIcon },
];

export default function MotherSidebar({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const pathname = usePathname();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  return (
    <>
      <aside className="hidden min-h-screen w-60 shrink-0 flex-col border-r border-border-color bg-white lg:flex">
        <div className="px-6 pb-5 pt-8">
          <p className="font-heading text-lg font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
          <p className="mt-1 text-xs font-medium text-lilac-dark">Mother</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-4">
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
                <span className="flex-1">{label}</span>
                {label === "Alerts" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-badge bg-pink-accent px-1.5 font-body text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            href="/mother/partner"
            className={cn(
              "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
              pathname === "/mother/partner" ? "bg-lilac-light text-lilac-dark" : "text-text-secondary hover:bg-lilac-light/50"
            )}
          >
            <PartnerIcon className="size-5" />
            Share with Partner
          </Link>

          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-button bg-critical font-heading text-sm font-bold text-white"
          >
            <AlertTriangleIcon className="size-[18px]" />
            Emergency Alert
          </button>
        </nav>
      </aside>

      <EmergencyConfirmSheet open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  );
}
