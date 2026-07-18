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
  const tierLabel = isPlatform ? "Super Admin" : "Facility Admin";
  const accent = isPlatform ? "#7C3AED" : "#2663EB";
  const displayName = admin.name?.trim() || (isPlatform ? "System Administrator" : "Facility Administrator");

  return (
    <aside className="hidden min-h-screen w-[240px] shrink-0 flex-col bg-[#1A1A2E] text-white lg:flex">
      <div className="px-6 pb-4 pt-8">
        <p className="font-semibold leading-tight">Ɔpemfoɔ Akwantuo</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#E4A8F3]">{tierLabel}</p>
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

      <div
        className="mx-3 mt-3 flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium"
        style={{ backgroundColor: `${accent}26`, color: accent }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
          <path
            fillRule="evenodd"
            d="M10 1.75a1 1 0 01.447.106l6 3A1 1 0 0117 5.75v4.5c0 4.03-2.611 7.437-6.435 8.61a1 1 0 01-.63 0C6.111 17.687 3.5 14.28 3.5 10.25v-4.5a1 1 0 01.553-.894l6-3A1 1 0 0110 1.75z"
            clipRule="evenodd"
          />
        </svg>
        {tierLabel} Access
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
