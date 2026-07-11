import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeDashboardData } from "@/lib/queries/midwife-dashboard";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  BellIcon,
  MidwifeIcon,
  PatientsIcon,
  ReferralArrowIcon,
  FlagIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";

const PRIORITY_BORDER: Record<string, string> = {
  CRITICAL: "border-critical",
  HIGH: "border-high",
  MEDIUM: "border-medium",
  LOW: "border-low",
};

export default async function MidwifeDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMidwifeDashboardData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="relative flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11">
        <p className="font-body text-[11px] font-medium tracking-[0.1em] text-white">MIDWIFE/NURSE</p>
        <p className="font-heading text-2xl font-bold text-white">{data.name}</p>
        <p className="font-body text-[13px] text-white">{data.facilityName}</p>
        <div className="absolute right-6 top-11 flex items-center gap-3">
          <div className="relative">
            <BellIcon className="size-6 text-white" />
            <span className="absolute -top-0.5 right-1 size-2 rounded-badge bg-pink-accent" />
          </div>
          <Link
            href="/midwife/profile"
            className="flex size-10 items-center justify-center rounded-badge bg-lilac-light"
            aria-label="View profile"
          >
            <MidwifeIcon className="size-5 text-lilac-dark" />
          </Link>
        </div>
      </div>

      {data.activeEmergency && (
        <div className="flex items-center gap-3 bg-critical px-5 py-3">
          <p className="flex-1 font-body text-[13px] text-white">
            🔴 EMERGENCY — {data.activeEmergency.patientName} has triggered an emergency alert ·{" "}
            {formatRelativeTime(data.activeEmergency.triggeredAt)}
          </p>
          <Link
            href={`/midwife/patients/${data.activeEmergency.patientId}`}
            className="shrink-0 rounded-[8px] bg-white px-3.5 py-1.5 font-body text-[13px] font-medium text-critical"
          >
            Respond
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6 px-5 pb-8 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <DashStat icon={PatientsIcon} iconColor="text-primary" label="Total Patients" value={data.stats.totalPatients} />
          <DashStat icon={ReferralArrowIcon} iconColor="text-pink-deep" label="Active Referrals" value={data.stats.activeReferrals} />
          <DashStat icon={FlagIcon} iconColor="text-high" label="Flags Today" value={data.stats.flagsToday} />
          <DashStat icon={ClockIcon} iconColor="text-primary" label="Pending Visits" value={data.stats.pendingVisits} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-text-primary">Needs attention</h2>
            {data.needsAttention.length > 0 && (
              <span className="flex size-7 items-center justify-center rounded-badge bg-critical-bg font-heading text-[13px] font-bold text-critical">
                {data.needsAttention.length}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {data.needsAttention.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No flagged patients right now.</p>
            )}
            {data.needsAttention.map((item) => (
              <Link
                key={item.visitId}
                href={`/midwife/patients/${item.patientId}`}
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
                  <p className="font-body text-[11px] text-[#9CA3AF]">
                    Recorded {formatRelativeTime(item.recordedAt)}
                  </p>
                  <p className="font-body text-[13px] font-medium text-lilac-dark">Review →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-[17px] font-bold text-text-primary">Today&apos;s visits</h2>
          <p className="font-body text-[13px] text-text-secondary">{data.todaysVisits.length} scheduled</p>
          <div className="mt-3 flex flex-col gap-2">
            {data.todaysVisits.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No visits scheduled today.</p>
            )}
            {data.todaysVisits.map((visit) => (
              <Link
                key={visit.patientId}
                href={`/midwife/patients/${visit.patientId}`}
                className="flex items-center gap-3 rounded-card bg-white p-3 shadow-card"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-badge bg-lilac-light">
                  <span className="font-heading text-[13px] font-bold text-lilac-deeper">{visit.initials}</span>
                </div>
                <div className="flex-1">
                  <p className="font-heading text-sm font-bold text-text-primary">{visit.name}</p>
                  <p className="font-body text-xs text-text-secondary">
                    {visit.week != null ? `Week ${visit.week} · ` : ""}
                    {visit.time ?? "Time TBD"}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 text-[#9CA3AF]" />
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
