import type { ReactNode } from "react";
import { getCurrentAdminIdentity } from "@/lib/current-admin";
import { initials } from "@/lib/utils";

export default async function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
}) {
  const identity = await getCurrentAdminIdentity();
  const isPlatform = identity?.facilityId === null;
  const tierLabel = isPlatform ? "Super Admin" : "Facility Admin";
  const displayName = identity?.name?.trim() || (isPlatform ? "System Administrator" : "Facility Administrator");

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white px-4 py-5 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-[#1A1A2E]">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
        {identity && (
          <div className="hidden items-center gap-2 lg:flex">
            <span className="flex items-center gap-1.5 rounded-full bg-[#F3E8FB] px-3 py-1 text-xs font-medium text-[#7C3AED]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                <path
                  fillRule="evenodd"
                  d="M10 1.75a1 1 0 01.447.106l6 3A1 1 0 0117 5.75v4.5c0 4.03-2.611 7.437-6.435 8.61a1 1 0 01-.63 0C6.111 17.687 3.5 14.28 3.5 10.25v-4.5a1 1 0 01.553-.894l6-3A1 1 0 0110 1.75z"
                  clipRule="evenodd"
                />
              </svg>
              {tierLabel}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white">
              {initials(displayName)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
