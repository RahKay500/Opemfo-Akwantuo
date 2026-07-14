import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeDashboardData } from "@/lib/queries/midwife-dashboard";
import type { QueueStatus, FlaggedStatus } from "@/lib/queries/midwife-dashboard";
import { formatRelativeTime, initials, cn } from "@/lib/utils";
import {
  BellIcon,
  MidwifeIcon,
  PatientsIcon,
  ReferralArrowIcon,
  FlagIcon,
  ClockIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
} from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import PatientsWeekChartLoader from "@/components/ui/PatientsWeekChartLoader";

const PRIORITY_BORDER: Record<string, string> = {
  CRITICAL: "border-critical",
  HIGH: "border-high",
  MEDIUM: "border-medium",
  LOW: "border-low",
};

const QUEUE_STATUS_STYLES: Record<QueueStatus, string> = {
  NORMAL: "bg-low-bg text-low",
  FLAGGED: "bg-high-bg text-high",
  CRITICAL: "bg-critical-bg text-critical",
};
const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = { NORMAL: "Normal", FLAGGED: "Flagged", CRITICAL: "Critical" };

const FLAGGED_DOT: Record<FlaggedStatus, string> = { FLAGGED: "bg-high", CRITICAL: "bg-critical", EMERGENCY: "bg-critical" };
const FLAGGED_LABEL: Record<FlaggedStatus, string> = { FLAGGED: "Flagged", CRITICAL: "Critical", EMERGENCY: "Emergency" };

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
      <div className="relative flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
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

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{data.facilityName}</p>
        </div>
        <div className="flex items-center gap-3">
          {data.activeEmergency && (
            <span className="flex items-center gap-1.5 rounded-badge bg-critical-bg px-3 py-1.5 font-body text-[13px] font-bold text-critical">
              <span className="size-1.5 rounded-badge bg-critical" />1 Emergency
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(data.name)}</span>
          </div>
        </div>
      </div>

      {data.activeEmergency && (
        <div className="flex items-center gap-3 bg-critical px-5 py-3 lg:hidden">
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

      {data.activeEmergency && (
        <div className="mx-5 mt-5 hidden items-center gap-3 rounded-card border border-critical/20 bg-critical-bg px-5 py-4 lg:flex">
          <AlertTriangleIcon className="size-5 shrink-0 text-critical" />
          <p className="flex-1 font-body text-sm text-critical">
            <span className="font-bold">Emergency Alert</span> — {data.activeEmergency.patientName} has triggered an
            emergency alert.
          </p>
          <Link
            href={`/midwife/patients/${data.activeEmergency.patientId}`}
            className="shrink-0 rounded-input bg-critical px-5 py-2.5 font-heading text-sm font-bold text-white"
          >
            Respond Now
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6 px-5 pb-8 pt-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DashStat
            icon={PatientsIcon}
            iconColor="text-primary"
            label="Today's Patients"
            value={data.stats.todaysPatients}
            subtitle={`${data.stats.todaysPatientsRemaining} remaining`}
          />
          <DashStat
            icon={ReferralArrowIcon}
            iconColor="text-pink-deep"
            label="Pending Referrals"
            value={data.stats.pendingReferrals}
            subtitle={`${data.stats.pendingReferralsCritical} critical`}
          />
          <DashStat
            icon={FlagIcon}
            iconColor="text-high"
            label="Flagged Vitals"
            value={data.stats.flaggedVitalsThisWeek}
            subtitle="This week"
          />
          <DashStat
            icon={ClockIcon}
            iconColor="text-primary"
            label="Total Registered"
            value={data.stats.totalRegistered}
            subtitle="Active patients"
          />
        </div>

        {/* Mobile only: flagged patients + today's visits as simple stacked lists. */}
        <div className="lg:hidden">
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

        <div className="lg:hidden">
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

        {/* Desktop only: patient queue table + flagged patients / weekly chart. */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
          <div className="rounded-card bg-white shadow-card">
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="font-heading text-lg font-bold text-text-primary">Today&apos;s Patient Queue</h2>
              <Link
                href="/midwife/patients"
                className="rounded-input border border-border-color px-3.5 py-1.5 font-body text-sm font-medium text-text-secondary"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-color text-left">
                    <th className="px-6 pb-3 font-body text-xs font-medium text-text-secondary">Patient</th>
                    <th className="px-3 pb-3 font-body text-xs font-medium text-text-secondary">Weeks</th>
                    <th className="px-3 pb-3 font-body text-xs font-medium text-text-secondary">Appointment</th>
                    <th className="px-3 pb-3 font-body text-xs font-medium text-text-secondary">Status</th>
                    <th className="px-6 pb-3 font-body text-xs font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.todaysQueue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 font-body text-sm text-text-secondary">
                        No patients scheduled today.
                      </td>
                    </tr>
                  )}
                  {data.todaysQueue.map((row) => (
                    <tr key={row.patientId} className="border-b border-border-color last:border-b-0">
                      <td className="px-6 py-3.5">
                        <p className="font-heading text-sm font-bold text-text-primary">{row.name}</p>
                        <p className="font-body text-xs text-text-secondary">{row.phone}</p>
                      </td>
                      <td className="px-3 py-3.5 font-body text-sm text-text-primary">
                        {row.week != null ? `Wk ${row.week}` : "—"}
                      </td>
                      <td className="px-3 py-3.5 font-body text-sm text-text-primary">
                        {row.appointmentTime ? `Today · ${row.appointmentTime}` : "Today"}
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={cn(
                            "inline-block rounded-badge px-2.5 py-1 font-body text-xs font-medium",
                            QUEUE_STATUS_STYLES[row.status]
                          )}
                        >
                          {QUEUE_STATUS_LABELS[row.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex gap-2">
                          <Link
                            href={`/midwife/patients/${row.patientId}/vitals`}
                            className="rounded-input bg-lilac-light px-3 py-1.5 font-body text-xs font-medium text-lilac-deeper"
                          >
                            Log Vitals
                          </Link>
                          <Link
                            href={`/midwife/patients/${row.patientId}`}
                            className="rounded-input bg-low-bg px-3 py-1.5 font-body text-xs font-medium text-low"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-2" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-card bg-white p-5 shadow-card">
              <h2 className="font-heading text-lg font-bold text-text-primary">Flagged Patients</h2>
              <div className="mt-3 flex flex-col">
                {data.flaggedPatients.length === 0 && (
                  <p className="font-body text-sm text-text-secondary">No flagged patients.</p>
                )}
                {data.flaggedPatients.map((p, i) => (
                  <Link
                    key={p.patientId}
                    href={`/midwife/patients/${p.patientId}`}
                    className={cn(
                      "flex items-center gap-3 py-3",
                      i < data.flaggedPatients.length - 1 && "border-b border-border-color"
                    )}
                  >
                    <span className={cn("size-2 shrink-0 rounded-badge", FLAGGED_DOT[p.status])} />
                    <div className="flex-1">
                      <p className="font-heading text-sm font-bold text-text-primary">{p.name}</p>
                      <p className="font-body text-xs text-text-secondary">
                        {p.week != null ? `Wk ${p.week} · ` : ""}
                        {FLAGGED_LABEL[p.status]}
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 text-[#9CA3AF]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-card bg-white p-5 shadow-card">
              <h2 className="font-heading text-lg font-bold text-text-primary">Patients This Week</h2>
              <div className="mt-3">
                <PatientsWeekChartLoader data={data.patientsThisWeek} />
              </div>
            </div>
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
  subtitle,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  iconColor: string;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-card lg:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-xs text-text-secondary lg:text-sm">{label}</p>
          <p className="mt-1 font-heading text-[28px] font-bold leading-none text-text-primary">{value}</p>
          {subtitle && <p className="mt-1.5 font-body text-xs text-text-secondary">{subtitle}</p>}
        </div>
        <Icon className={cn("size-[22px]", iconColor)} />
      </div>
    </div>
  );
}
