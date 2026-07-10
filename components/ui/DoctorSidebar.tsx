"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavRecordsIcon, NavProfileIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/doctor/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/doctor/inbox", label: "Inbox", icon: NavRecordsIcon },
  { href: "/doctor/profile", label: "Profile", icon: NavProfileIcon },
];

export default function DoctorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border-color bg-white">
      <div className="px-6 pb-6 pt-8">
        <p className="font-heading text-lg font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
        <p className="mt-1 text-xs font-medium text-lilac-dark">Doctor</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
      </nav>
    </aside>
  );
}
