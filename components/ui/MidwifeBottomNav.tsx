"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavPatientsIcon, PlusIcon, NavReferralsIcon, CalendarIcon, NavProfileIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/midwife/dashboard", label: "Home", icon: NavHomeIcon, isFab: false },
  { href: "/midwife/patients", label: "Patients", icon: NavPatientsIcon, isFab: false },
  { href: "/midwife/referral", label: "Referrals", icon: NavReferralsIcon, isFab: false },
  { href: "/midwife/register", label: "Register", icon: PlusIcon, isFab: true },
  { href: "/midwife/appointments", label: "Appts", icon: CalendarIcon, isFab: false },
  { href: "/midwife/profile", label: "Profile", icon: NavProfileIcon, isFab: false },
] as const;

export default function MidwifeBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-20 w-full border-t border-border-color bg-white">
      {NAV_ITEMS.map(({ href, label, icon: Icon, isFab }) => {
        const active = pathname === href;
        if (isFab) {
          return (
            <Link key={href} href={href} className="flex flex-1 flex-col items-center justify-center gap-1">
              <div className="-mt-4 flex size-12 items-center justify-center rounded-badge bg-primary shadow-[0px_4px_6px_rgba(110,46,148,0.4)]">
                <Icon className="size-[22px] text-white" />
              </div>
              <span className="font-body text-[11px] font-medium text-text-secondary">{label}</span>
            </Link>
          );
        }
        return (
          <Link key={href} href={href} className="flex flex-1 flex-col items-center justify-center gap-1">
            <Icon className={cn("size-[22px]", active ? "text-lilac-dark" : "text-text-secondary")} />
            <span className={cn("font-body text-[11px] font-medium", active ? "text-lilac-dark" : "text-text-secondary")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
