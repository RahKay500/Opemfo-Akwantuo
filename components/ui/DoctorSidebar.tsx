"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, facilityTypeLabel, initials } from "@/lib/utils";
import type { FacilityType } from "@prisma/client";
import {
  NavHomeIcon,
  NavReferralsIcon,
  NavRecordsIcon,
  AnalyticsIcon,
  NavProfileIcon,
  ShareIcon,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: NavHomeIcon },
  { href: "/doctor/referral-queue", label: "Referral Queue", icon: NavReferralsIcon },
  { href: "/doctor/inbox", label: "Patient Records", icon: NavRecordsIcon, badgeKey: "shares" as const },
  { href: "/doctor/analytics", label: "Analytics", icon: AnalyticsIcon },
];

export default function DoctorSidebar({
  name,
  facilityName,
  facilityType,
  newSharedRecordsCount,
}: {
  name: string;
  facilityName: string;
  facilityType: FacilityType | null;
  newSharedRecordsCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 flex-col bg-[#1F1F32] lg:flex">
      <div className="px-6 pb-5 pt-8">
        <p className="font-heading text-lg font-bold text-lilac-mid">Ɔpemfoɔ</p>
        <p className="mt-1 font-body text-[11px] font-medium tracking-[0.08em] text-[#8A8AA3]">
          {facilityType ? facilityTypeLabel(facilityType).toUpperCase() : "HOSPITAL"}
        </p>
      </div>

      <div className="mx-4 mb-2 flex items-center gap-2.5 rounded-card bg-[#27273A] px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-badge bg-lilac-mid">
          <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(name)}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-medium text-white">{name}</p>
          <p className="truncate font-body text-xs text-[#8A8AA3]">{facilityName} · Doctor</p>
        </div>
      </div>

      {newSharedRecordsCount > 0 && (
        <Link
          href="/doctor/inbox"
          className="mx-4 mb-2 flex items-center gap-2 rounded-card bg-pink-deep/15 px-3 py-2.5 font-body text-[13px] font-medium text-pink-accent"
        >
          <ShareIcon className="size-4" />
          {newSharedRecordsCount} new shared record{newSharedRecordsCount === 1 ? "" : "s"}
        </Link>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
                active ? "bg-lilac-mid text-lilac-deeper" : "text-[#9494AC] hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-5" />
                {label}
              </span>
              {badgeKey === "shares" && newSharedRecordsCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-badge bg-pink-deep font-body text-[11px] font-bold text-white">
                  {newSharedRecordsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/doctor/profile"
          className={cn(
            "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
            pathname === "/doctor/profile" ? "bg-lilac-mid text-lilac-deeper" : "text-[#9494AC] hover:bg-white/5"
          )}
        >
          <NavProfileIcon className="size-5" />
          Profile & Settings
        </Link>
      </div>
    </aside>
  );
}
