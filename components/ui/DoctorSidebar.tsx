"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import { NavHomeIcon, NavRecordsIcon, NavProfileIcon } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/doctor/dashboard", label: "Home", icon: NavHomeIcon },
  { href: "/doctor/inbox", label: "Inbox", icon: NavRecordsIcon },
];

export default function DoctorSidebar({ name, facilityName }: { name: string; facilityName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 flex-col bg-[#1F1F32] lg:flex">
      <div className="px-6 pb-5 pt-8">
        <p className="font-heading text-lg font-bold text-lilac-mid">Ɔpemfoɔ</p>
        <p className="mt-1 font-body text-[11px] font-medium tracking-[0.08em] text-[#8A8AA3]">HOSPITAL</p>
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

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
                active ? "bg-lilac-mid text-lilac-deeper" : "text-[#9494AC] hover:bg-white/5"
              )}
            >
              <Icon className="size-5" />
              {label}
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
          Profile
        </Link>
      </div>
    </aside>
  );
}
