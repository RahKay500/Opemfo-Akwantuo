"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { getAdminNavItems } from "@/lib/admin-nav";

export default function Sidebar({ facilityId }: { facilityId: string | null }) {
  const pathname = usePathname();
  const navItems = getAdminNavItems(facilityId);

  return (
    <aside className="hidden min-h-screen w-[240px] shrink-0 flex-col bg-[#1A1A2E] text-white lg:flex">
      <div className="px-6 pb-6 pt-8">
        <p className="font-semibold leading-tight">Ɔpemfoɔ Akwantuo</p>
        <p className="mt-1 text-xs font-medium text-[#E4A8F3]">Admin Portal</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
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
