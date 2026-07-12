"use client";

import Link from "next/link";
import Image from "next/image";
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
  NavProfileIcon,
  PartnerIcon,
} from "@/components/ui/icons";
import EmergencyConfirmSheet from "@/components/ui/EmergencyConfirmSheet";
import SharePartnerSheet from "@/components/ui/SharePartnerSheet";

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
  name,
  week,
  dueDate,
  progressPercent,
  unreadCount,
}: {
  name: string;
  week: number | null;
  dueDate: string | null;
  progressPercent: number | null;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <>
      <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border-color bg-white">
        <div className="px-6 pb-5 pt-8">
          <p className="font-heading text-lg font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
          <p className="mt-1 text-xs font-medium text-lilac-dark">Mother</p>
        </div>

        <div className="border-b border-border-color px-6 pb-5">
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
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-badge bg-pink-deep px-1.5 font-body text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setPartnerOpen(true)}
            className="flex items-center gap-3 rounded-input px-4 py-2.5 text-left font-body text-sm font-medium text-text-secondary hover:bg-lilac-light/50"
          >
            <PartnerIcon className="size-5" />
            Share with Partner
          </button>
        </nav>

        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-button bg-critical font-heading text-sm font-bold text-white"
          >
            <AlertTriangleIcon className="size-[18px]" />
            Emergency Alert
          </button>
        </div>
      </aside>

      <EmergencyConfirmSheet open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <SharePartnerSheet open={partnerOpen} onClose={() => setPartnerOpen(false)} />
    </>
  );
}
