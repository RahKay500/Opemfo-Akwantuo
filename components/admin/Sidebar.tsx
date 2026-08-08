"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { getAdminNavItems } from "@/lib/admin-nav";
import { initials } from "@/lib/utils";

export interface SidebarAdmin {
  name: string | null;
  orgName: string | null;
  district: string | null;
  region: string | null;
}

export default function Sidebar({ facilityId, admin }: { facilityId: string | null; admin: SidebarAdmin }) {
  const pathname = usePathname();
  const navItems = getAdminNavItems(facilityId);
  const isPlatform = facilityId === null;
  const accent = isPlatform ? "#7C3AED" : "#2663EB";
  const displayName = admin.name?.trim() || (isPlatform ? "System Administrator" : "Facility Administrator");

  return (
    <aside className="hidden min-h-screen w-[240px] shrink-0 flex-col bg-[#1A1A2E] text-white lg:flex">
      <div className="px-6 pb-4 pt-8">
        <p className="font-semibold leading-tight">Ɔpemfoɔ Akwantuo</p>
      </div>

      <div className="mx-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {initials(displayName)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-white">{displayName}</p>
          {admin.orgName && <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/60">{admin.orgName}</p>}
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              style={active ? { backgroundColor: accent } : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {(admin.district || admin.region) && (
        <div className="border-t border-white/10 px-6 py-4 text-xs leading-snug text-white/50">
          {admin.district && <p>{admin.district}</p>}
          {admin.region && <p>{admin.region}, Ghana</p>}
        </div>
      )}

      <div className="border-t border-white/10 px-3 py-4">
        <AdminSignOutButton />
      </div>
    </aside>
  );
}
