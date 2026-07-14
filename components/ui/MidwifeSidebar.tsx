"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import {
  NavHomeIcon,
  NavPatientsIcon,
  HeartRateIcon,
  NavReferralsIcon,
  PlusIcon,
  NavProfileIcon,
  AlertTriangleIcon,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/midwife/dashboard", label: "Dashboard", icon: NavHomeIcon },
  { href: "/midwife/patients", label: "Patients", icon: NavPatientsIcon },
  { href: "/midwife/patients", label: "Log Vitals", icon: HeartRateIcon },
  { href: "/midwife/referral", label: "Referrals", icon: NavReferralsIcon },
  { href: "/midwife/register", label: "Register Patient", icon: PlusIcon },
];

export default function MidwifeSidebar({
  name,
  facilityName,
  activeEmergency,
}: {
  name: string;
  facilityName: string;
  activeEmergency: { patientId: string; patientName: string } | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[#1F1F32]">
      <div className="px-6 pb-5 pt-8">
        <p className="font-heading text-lg font-bold text-lilac-mid">Ɔpimfuo</p>
        <p className="mt-1 font-body text-[11px] font-medium tracking-[0.08em] text-[#8A8AA3]">CHPS MANAGEMENT</p>
      </div>

      <div className="mx-4 mb-2 flex items-center gap-2.5 rounded-card bg-[#27273A] px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-badge bg-lilac-mid">
          <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(name)}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-medium text-white">{name}</p>
          <p className="truncate font-body text-xs text-[#8A8AA3]">{facilityName} · Midwife</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href && label !== "Log Vitals";
          return (
            <Link
              key={label}
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
          href="/midwife/profile"
          className={cn(
            "flex items-center gap-3 rounded-input px-4 py-2.5 font-body text-sm font-medium",
            pathname === "/midwife/profile" ? "bg-lilac-mid text-lilac-deeper" : "text-[#9494AC] hover:bg-white/5"
          )}
        >
          <NavProfileIcon className="size-5" />
          Profile
        </Link>
      </div>

      {activeEmergency && (
        <div className="px-3 pb-4">
          <Link
            href={`/midwife/patients/${activeEmergency.patientId}`}
            className="block rounded-card bg-critical-bg px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4 shrink-0 text-critical" />
              <p className="font-body text-[13px] font-bold text-critical">1 Active Emergency</p>
            </div>
            <p className="mt-1 truncate font-body text-xs text-critical">{activeEmergency.patientName} · Tap to respond</p>
          </Link>
        </div>
      )}
    </aside>
  );
}
