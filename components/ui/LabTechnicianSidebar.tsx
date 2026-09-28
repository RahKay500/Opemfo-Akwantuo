"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavProfileIcon } from "@/components/ui/icons";

const NAV_ITEMS = [{ href: "/lab-technician/dashboard", label: "Dashboard", icon: NavHomeIcon }];

export default function LabTechnicianSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 flex-col bg-[#1F1F32] lg:flex">
      <div className="px-6 pb-5 pt-8">
        <p className="font-heading text-lg font-bold leading-tight text-lilac-mid">Ɔpemfoɔ Akwantuo</p>
        <p className="mt-1 font-body text-[11px] font-medium tracking-[0.08em] text-[#8A8AA3]">LAB TECHNICIAN</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
                active ? "bg-lilac-mid text-lilac-deeper" : "text-[#9494AC] hover:bg-white/5"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-5" />
                {label}
              </span>
              {pendingCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-badge bg-pink-deep font-body text-[11px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/lab-technician/profile"
          className={cn(
            "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
            pathname === "/lab-technician/profile" ? "bg-lilac-mid text-lilac-deeper" : "text-[#9494AC] hover:bg-white/5"
          )}
        >
          <NavProfileIcon className="size-5" />
          Profile
        </Link>
      </div>
    </aside>
  );
}
