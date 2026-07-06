"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavRecordsIcon, NavProfileIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/doctor/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/doctor/inbox", label: "Inbox", icon: NavRecordsIcon },
  { href: "/doctor/profile", label: "Profile", icon: NavProfileIcon },
] as const;

export default function DoctorBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-20 w-full border-t border-border-color bg-white">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
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
