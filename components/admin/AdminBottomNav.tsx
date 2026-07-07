"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/facilities", label: "Facilities" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-16 w-full border-t border-[#E2E8F0] bg-white">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-1 px-1"
          >
            <span className={cn("text-[11px] font-medium", active ? "text-[#1A1A2E]" : "text-[#9CA3AF]")}>
              {item.label}
            </span>
            <span className={cn("h-0.5 w-5 rounded-full", active ? "bg-[#E4A8F3]" : "bg-transparent")} />
          </Link>
        );
      })}
    </nav>
  );
}
