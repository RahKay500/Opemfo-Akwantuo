"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/facilities", label: "Facilities" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/audit", label: "Audit Log" },
  { href: "/admin/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col bg-[#1A1A2E] text-white">
      <div className="px-6 pb-6 pt-8">
        <p className="font-semibold leading-tight">Ɔpemfoɔ Akwantuo</p>
        <p className="mt-1 text-xs font-medium text-[#E4A8F3]">Admin Portal</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-r-md border-l-[3px] px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-[#E4A8F3] bg-white/10 text-white"
                  : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <AdminSignOutButton />
      </div>
    </aside>
  );
}
