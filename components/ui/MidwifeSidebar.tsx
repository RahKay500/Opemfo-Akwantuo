"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavPatientsIcon, PlusIcon, NavReferralsIcon, NavProfileIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/midwife/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/midwife/patients", label: "Patients", icon: NavPatientsIcon },
  { href: "/midwife/register", label: "Register", icon: PlusIcon },
  { href: "/midwife/referral", label: "Referrals", icon: NavReferralsIcon },
  { href: "/midwife/profile", label: "Profile", icon: NavProfileIcon },
];

export default function MidwifeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border-color bg-white">
      <div className="px-6 pb-6 pt-8">
        <p className="font-heading text-lg font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
        <p className="mt-1 text-xs font-medium text-lilac-dark">Midwife</p>
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
      </nav>
    </aside>
  );
}
