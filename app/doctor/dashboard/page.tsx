import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorDashboardData } from "@/lib/queries/doctor-dashboard";
import { initials } from "@/lib/utils";
import { DOCTOR_REFERRAL_STATUS } from "@/lib/referral-status";
import { BellIcon, DoctorIcon, ShareIcon, CalendarIcon, ReferralArrowIcon } from "@/components/ui/icons";
import MonthlyReferralsChartLoader from "@/components/ui/MonthlyReferralsChartLoader";
import ReferralActionButton from "@/components/ui/ReferralActionButton";
import type { Priority } from "@prisma/client";

const PRIORITY_BORDER: Record<Priority, string> = {
  CRITICAL: "border-critical",
  HIGH: "border-high",
  MEDIUM: "border-medium",
  LOW: "border-low",
};

const PRIORITY_PILL: Record<Priority, string> = {
  CRITICAL: "bg-critical-bg text-critical",
  HIGH: "bg-high-bg text-high",
  MEDIUM: "bg-medium-bg text-medium",
  LOW: "bg-low-bg text-low",
};

function sentLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const datePart = isToday ? "Today" : d.toLocaleDateString("en-GH", { day: "numeric", month: "short" });
  const timePart = d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} · ${timePart}`;
}

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
      <div className="relative flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-body text-[11px] font-medium tracking-[0.1em] text-white">DOCTOR</p>
        <p className="font-heading text-2xl font-bold text-white">{data.name}</p>
        <p className="font-body text-[13px] text-white">{data.facilityName}</p>
        <div className="absolute right-6 top-11 flex items-center gap-3">
          <div className="relative">
            <BellIcon className="size-6 text-white" />
            {data.stats.incomingCritical > 0 && <span className="absolute -top-0.5 right-1 size-2 rounded-badge bg-pink-accent" />}
          </div>
          <Link
            href="/doctor/profile"
            className="flex size-10 items-center justify-center rounded-badge bg-lilac-light"
            aria-label="View profile"
          >
            <DoctorIcon className="size-5 text-[#EA580C]" />
          </Link>
        </div>
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{data.facilityName}</p>
        </div>
        <div className="flex items-center gap-3">
          {data.stats.recordsShared > 0 && (
            <span className="rounded-badge bg-pink-soft px-3 py-1.5 font-body text-[13px] font-bold text-pink-deep">
              {data.stats.recordsShared} shared record{data.stats.recordsShared === 1 ? "" : "s"} pending review
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(data.name)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-5 lg:px-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <DashStat
            label="Incoming Referrals"
            value={data.stats.incomingReferrals}
            valueColor={data.stats.incomingCritical > 0 ? "text-critical" : "text-text-primary"}
            caption={`${data.stats.incomingCritical} critical`}
            icon={ReferralArrowIcon}
            iconColor="text-critical"
          />
          <DashStat
            label="Seen Today"
            value={data.stats.seenToday}
            caption={`of ${data.stats.scheduledToday} scheduled`}
          />
          <DashStat
            label="Records Shared"
            value={data.stats.recordsShared}
            valueColor="text-lilac-deeper"
            caption="Awaiting review"
            icon={ShareIcon}
            iconColor="text-lilac-dark"
          />
          <DashStat
            label="This Week"
            value={data.stats.referralsThisWeek}
            caption="Referrals received"
            icon={CalendarIcon}
            iconColor="text-text-secondary"
          />
        </div>

        {data.newSharedRecord && (
          <div className="flex flex-col gap-4 rounded-card bg-pink-soft p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
            <div className="flex items-start gap-3">
              <ShareIcon className="mt-0.5 size-5 shrink-0 text-pink-deep" />
              <p className="font-body text-sm text-text-primary">
                <span className="font-bold text-pink-deep">New shared record</span> — Nurse {data.newSharedRecord.sharedByName}{" "}
                shared {data.newSharedRecord.patientName}&apos;s vitals trend for your review.
              </p>
            </div>
            <Link
              href={`/doctor/patients/${data.newSharedRecord.patientId}`}
              className="flex h-11 shrink-0 items-center justify-center rounded-input bg-pink-deep px-5 font-body text-sm font-bold text-white"
            >
              View Record
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr] lg:gap-6">
          <div className="rounded-card bg-white shadow-card">
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="font-heading text-lg font-bold text-text-primary">Referral Queue</h2>
              <Link
                href="/doctor/referral-queue"
                className="rounded-input border-[1.5px] border-border-color px-4 py-1.5 font-body text-[13px] font-medium text-text-primary"
              >
                View all
              </Link>
            </div>
            <div className="mt-3 flex flex-col">
              {data.referralQueue.length === 0 && (
                <p className="px-5 pb-5 font-body text-sm text-text-secondary">No referrals to this facility yet.</p>
              )}
              {data.referralQueue.map((r, i) => {
                const status = DOCTOR_REFERRAL_STATUS[r.status];
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between gap-3 border-l-4 px-5 py-4 ${PRIORITY_BORDER[r.priority]} ${
                      i === data.referralQueue.length - 1 ? "" : "border-b border-b-border-color"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-base font-bold text-text-primary">{r.patientName}</p>
                        <span className={`rounded-badge px-2.5 py-1 font-body text-xs font-medium ${PRIORITY_PILL[r.priority]}`}>
                          {r.priority.charAt(0) + r.priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-1 font-body text-[13px] text-text-secondary">{r.reason}</p>
                      <p className="mt-1.5 font-body text-xs text-[#9CA3AF]">
                        {r.fromFacilityName} {r.week != null ? `· Wk ${r.week}` : ""} · {sentLabel(r.sentAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-badge px-2.5 py-1 font-body text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      <ReferralActionButton referralId={r.id} status={r.status} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-2" />
          </div>

          <div className="rounded-card bg-white p-5 shadow-card">
            <h2 className="font-heading text-lg font-bold text-text-primary">Monthly Referrals</h2>
            <p className="mt-0.5 font-body text-sm text-text-secondary">Received vs. seen</p>
            <div className="mt-3">
              <MonthlyReferralsChartLoader data={data.monthlyReferrals} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashStat({
  label,
  value,
  valueColor = "text-text-primary",
  caption,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: number;
  valueColor?: string;
  caption: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  iconColor?: string;
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-card lg:p-5">
      <div className="flex items-start justify-between">
        <p className="font-body text-sm text-text-secondary">{label}</p>
        {Icon && <Icon className={`size-[18px] ${iconColor}`} />}
      </div>
      <p className={`mt-1.5 font-heading text-[28px] font-bold leading-none ${valueColor}`}>{value}</p>
      <p className="mt-1.5 font-body text-xs text-text-secondary">{caption}</p>
    </div>
  );
}
