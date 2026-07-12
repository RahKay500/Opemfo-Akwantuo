"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavRecordsIcon, NavReferralIcon, NavProfileIcon, EmergencyBellIcon } from "@/components/ui/icons";
import EmergencyConfirmSheet from "@/components/ui/EmergencyConfirmSheet";

const NAV_ITEMS = [
  { href: "/mother/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/mother/records", label: "Records", icon: NavRecordsIcon },
  { href: "/mother/referral", label: "Referral", icon: NavReferralIcon },
];

// The tab that used to just link to notifications now triggers the
// emergency-alert flow instead (the header's bell icon is the one that opens
// notifications now) — an emergency action deserves a permanent, obvious tab,
// not a floating button someone might not think to look for under pressure.
export default function MotherBottomNav() {
  const pathname = usePathname();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const profileActive = pathname === "/mother/profile";

  return (
    <>
      <nav className="flex h-20 w-full border-t border-border-color bg-white">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-1 flex-col items-center justify-center gap-1">
              <Icon className={cn("size-[22px]", active ? "text-lilac-dark" : "text-text-secondary")} />
              <span className={cn("font-body text-[11px] font-medium", active ? "text-lilac-dark" : "text-text-secondary")}>
                {label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setEmergencyOpen(true)}
          aria-label="Trigger emergency alert"
          className="relative flex flex-1 flex-col items-center justify-center gap-1"
        >
          <motion.span
            className="pointer-events-none absolute left-1/2 top-[13px] size-[22px] -translate-x-1/2 rounded-badge bg-critical/40"
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <EmergencyBellIcon fill="currentColor" className="size-[22px] text-critical" />
          <span className="font-body text-[11px] font-medium text-critical">Emergency</span>
        </button>

        <Link href="/mother/profile" className="flex flex-1 flex-col items-center justify-center gap-1">
          <NavProfileIcon className={cn("size-[22px]", profileActive ? "text-lilac-dark" : "text-text-secondary")} />
          <span className={cn("font-body text-[11px] font-medium", profileActive ? "text-lilac-dark" : "text-text-secondary")}>
            Profile
          </span>
        </Link>
      </nav>

      <EmergencyConfirmSheet open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  );
}
