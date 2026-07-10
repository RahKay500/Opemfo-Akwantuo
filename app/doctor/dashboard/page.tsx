import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorDashboardData } from "@/lib/queries/doctor-dashboard";
import { formatRelativeTime, initials, cn } from "@/lib/utils";
import { BellIcon, ShareIcon, CheckIcon, FlagIcon, ReferralArrowIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";

const PRIORITY_BORDER: Record<string, string> = {
  CRITICAL: "border-critical",
  HIGH: "border-high",
  MEDIUM: "border-medium",
  LOW: "border-low",
};

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDoctorDashboardData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">Account not found.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="relative flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11">
        <p className="font-body text-[11px] font-medium tracking-[0.1em] text-lilac-deeper/70">DOCTOR</p>
        <p className="font-heading text-2xl font-bold text-lilac-deeper">{data.name}</p>
        <p className="font-body text-[13px] text-lilac-deeper/70">{data.facilityName}</p>
        <div className="absolute right-6 top-11 flex items-center gap-3">
          <div className="relative">
            <BellIcon className="size-6 text-lilac-deeper" />
            {data.stats.flagged > 0 && <span className="absolute -top-0.5 right-1 size-2 rounded-badge bg-pink-accent" />}
          </div>
          <Link
            href="/doctor/profile"
            className="flex size-10 items-center justify-center rounded-badge bg-lilac-light"
            aria-label="View profile"
          >
            <span className="font-heading text-sm font-bold text-lilac-deeper">{initials(data.name)}</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <DashStat icon={ShareIcon} iconColor="text-primary" label="Active Shares" value={data.stats.activeShares} />
          <DashStat icon={CheckIcon} iconColor="text-[#16A34A]" label="Reviewed" value={data.stats.reviewed} />
          <DashStat icon={FlagIcon} iconColor="text-high" label="Flagged" value={data.stats.flagged} />
          <DashStat icon={ReferralArrowIcon} iconColor="text-pink-deep" label="Facilities" value={data.stats.facilities} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-text-primary">Needs review</h2>
            {data.needsReview.length > 0 && (
              <span className="flex size-7 items-center justify-center rounded-badge bg-critical-bg font-heading text-[13px] font-bold text-critical">
                {data.needsReview.length}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {data.needsReview.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No flagged records right now.</p>
            )}
            {data.needsReview.map((item) => (
              <Link
                key={item.shareId}
                href={`/doctor/patients/${item.patientId}`}
                className={cn(
                  "block rounded-card border-l-4 bg-white py-4 pl-5 pr-4 shadow-card",
                  PRIORITY_BORDER[item.priority]
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-heading text-base font-bold text-text-primary">{item.name}</p>
                  <PriorityBadge priority={item.priority} className="px-2.5 py-1 text-xs" />
                </div>
                <p className="mt-1.5 font-body text-[13px] text-text-secondary">{item.reason}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <p className="font-body text-[11px] text-[#9CA3AF]">Shared {formatRelativeTime(item.sharedAt)}</p>
                  <p className="font-body text-[13px] font-medium text-lilac-dark">Review →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-[17px] font-bold text-text-primary">Recent shares</h2>
          <p className="font-body text-[13px] text-text-secondary">{data.recentShares.length} active</p>
          <div className="mt-3 flex flex-col gap-2">
            {data.recentShares.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No records shared with you yet.</p>
            )}
            {data.recentShares.map((s) => (
              <Link
                key={s.shareId}
                href={`/doctor/patients/${s.patientId}`}
                className="flex items-center gap-3 rounded-card bg-white p-3 shadow-card"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-badge bg-lilac-light">
                  <span className="font-heading text-[13px] font-bold text-lilac-deeper">{initials(s.name)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm font-bold text-text-primary">{s.name}</p>
                  <p className="font-body text-xs text-text-secondary">Shared by {s.sharedByName}</p>
                </div>
                <p className="font-body text-[11px] text-[#9CA3AF]">{formatRelativeTime(s.sharedAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function DashStat({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  iconColor: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-xs text-text-secondary">{label}</p>
          <p className="mt-1 font-heading text-[28px] font-bold leading-none text-text-primary">{value}</p>
        </div>
        <Icon className={cn("size-[22px]", iconColor)} />
      </div>
    </div>
  );
}
