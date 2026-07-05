"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavHomeIcon,
  NavRecordsIcon,
  NavReferralIcon,
  NavAlertsIcon,
  NavProfileIcon,
} from "@/components/ui/icons";

// Keyed by string, not component reference: the layouts that configure this
// nav are Server Components, and passing a component/function as a prop
// across the server->client boundary isn't allowed in RSC.
const ICONS = {
  home: NavHomeIcon,
  records: NavRecordsIcon,
  referral: NavReferralIcon,
  alerts: NavAlertsIcon,
  profile: NavProfileIcon,
};

export type NavIconKey = keyof typeof ICONS;

export interface BottomNavItem {
  href: string;
  label: string;
  icon: NavIconKey;
}

export default function BottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-20 w-full border-t border-border-color bg-white">
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon className={cn("size-[22px]", active ? "text-lilac-dark" : "text-text-secondary")} />
            <span
              className={cn(
                "font-body text-[11px] font-medium",
                active ? "text-lilac-dark" : "text-text-secondary"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
