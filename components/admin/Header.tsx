import type { ReactNode } from "react";
import { getCurrentAdminIdentity } from "@/lib/current-admin";
import HeaderIdentityMenu from "@/components/admin/HeaderIdentityMenu";
import NotificationBell from "@/components/admin/NotificationBell";

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
  // Platform Super Admin's accent is pulled from the shared design system's
  // own brand ramp (brand-700) rather than an unrelated raw hex, so it reads
  // as a deliberate variation on this app's identity, not a bolted-on tool.
  const accent = isPlatform ? "#9F1AB1" : "#2663EB";
  const displayName = identity?.name?.trim() || (isPlatform ? "System Administrator" : "Facility Administrator");

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white px-4 py-5 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-[#1A1A2E]">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
        {identity && !isPlatform && <NotificationBell />}
        {identity && (
          <HeaderIdentityMenu displayName={displayName} orgName={identity.orgName} tierLabel={tierLabel} accent={accent} />
        )}
      </div>
    </div>
  );
}
