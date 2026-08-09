"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminNavItems } from "@/lib/admin-nav";

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
  // Platform Super Admin's accent is pulled from the shared design system's
  // own brand ramp (brand-700) rather than an unrelated raw hex, so it reads
  // as a deliberate variation on this app's identity, not a bolted-on tool.
  const accent = isPlatform ? "#9F1AB1" : "#2663EB";

  return (
    <aside className="hidden min-h-screen w-[240px] shrink-0 flex-col bg-[#1A1A2E] text-white lg:flex">
      <div className="px-6 pb-4 pt-8">
        <p className="font-semibold leading-tight">Ɔpemfoɔ Akwantuo</p>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              style={active ? { backgroundColor: accent } : undefined}
            >
              <Icon className="size-5 shrink-0" />
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
    </aside>
  );
}
