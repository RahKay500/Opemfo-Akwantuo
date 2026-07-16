import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorAnalyticsData } from "@/lib/queries/doctor-analytics";
import { initials } from "@/lib/utils";
import MonthlyReferralsChartLoader from "@/components/ui/MonthlyReferralsChartLoader";
import type { Priority, ReferralStatus } from "@prisma/client";

const PRIORITY_COLOR: Record<Priority, string> = {
  CRITICAL: "bg-critical",
  HIGH: "bg-high",
  MEDIUM: "bg-medium",
  LOW: "bg-low",
};

// Distinct per-status labels/colors for the breakdown chart — unlike the
// referral queue's DOCTOR_REFERRAL_STATUS map, PATIENT_ARRIVED and COMPLETED
// need their own rows here rather than collapsing to the same "Accepted".
const STATUS_BREAKDOWN: Record<ReferralStatus, { label: string; bar: string }> = {
  SENT: { label: "Awaiting", bar: "bg-medium" },
  ACKNOWLEDGED: { label: "In Review", bar: "bg-lilac-dark" },
  PATIENT_ARRIVED: { label: "Arrived", bar: "bg-low" },
  COMPLETED: { label: "Completed", bar: "bg-[#16A34A]" },
  CANCELLED: { label: "Cancelled", bar: "bg-[#9CA3AF]" },
};

export default async function DoctorAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDoctorAnalyticsData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  const maxPriority = Math.max(...data.byPriority.map((p) => p.count), 1);
  const maxStatus = Math.max(...data.byStatus.map((s) => s.count), 1);
  const maxFacility = Math.max(...data.byFacility.map((f) => f.count), 1);

  return (
    <main className="flex flex-col">
      <div className="relative flex items-center justify-center border-b border-border-color bg-white px-5 pb-4 pt-14 lg:hidden">
        <h1 className="font-heading text-xl font-bold text-text-primary">Analytics</h1>
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Analytics</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{data.facilityName}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
          <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(data.facilityName)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-8 pt-5 lg:gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatTile label="Total Referrals" value={String(data.totalReferrals)} />
          <StatTile label="Avg. Response Time" value={data.avgResponseTimeLabel ?? "—"} />
          <StatTile label="Avg. Time to Arrival" value={data.avgTimeToArrivalLabel ?? "—"} />
          <StatTile label="Completion Rate" value={data.completionRate != null ? `${data.completionRate}%` : "—"} />
        </div>

        <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
          <h2 className="font-heading text-lg font-bold text-text-primary">Monthly Referrals</h2>
          <p className="mt-0.5 font-body text-sm text-text-secondary">Received vs. seen, last 12 months</p>
          <div className="mt-3">
            <MonthlyReferralsChartLoader data={data.monthlyReferrals} />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
            <h2 className="font-heading text-base font-bold text-text-primary">By Priority</h2>
            <div className="mt-4 flex flex-col gap-3">
              {data.byPriority.map((p) => (
                <div key={p.priority} className="flex items-center gap-3">
                  <p className="w-16 shrink-0 font-body text-xs text-text-secondary">
                    {p.priority.charAt(0) + p.priority.slice(1).toLowerCase()}
                  </p>
                  <div className="h-2 flex-1 overflow-hidden rounded-badge bg-[#F3F4F6]">
                    <div
                      className={`h-full rounded-badge ${PRIORITY_COLOR[p.priority]}`}
                      style={{ width: `${(p.count / maxPriority) * 100}%` }}
                    />
                  </div>
                  <p className="w-6 shrink-0 text-right font-body text-xs font-bold text-text-primary">{p.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
            <h2 className="font-heading text-base font-bold text-text-primary">By Status</h2>
            <div className="mt-4 flex flex-col gap-3">
              {data.byStatus.map((s) => {
                const style = STATUS_BREAKDOWN[s.status];
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <p className="w-24 shrink-0 font-body text-xs text-text-secondary">{style.label}</p>
                    <div className="h-2 flex-1 overflow-hidden rounded-badge bg-[#F3F4F6]">
                      <div
                        className={`h-full rounded-badge ${style.bar}`}
                        style={{ width: `${(s.count / maxStatus) * 100}%` }}
                      />
                    </div>
                    <p className="w-6 shrink-0 text-right font-body text-xs font-bold text-text-primary">{s.count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
          <h2 className="font-heading text-base font-bold text-text-primary">Top Referring Facilities</h2>
          {data.byFacility.length === 0 && (
            <p className="mt-3 font-body text-sm text-text-secondary">No referrals received yet.</p>
          )}
          <div className="mt-4 flex flex-col gap-3">
            {data.byFacility.map((f) => (
              <div key={f.facilityName} className="flex items-center gap-3">
                <p className="w-52 shrink-0 truncate font-body text-sm text-text-primary">{f.facilityName}</p>
                <div className="h-2 flex-1 overflow-hidden rounded-badge bg-[#F3F4F6]">
                  <div className="h-full rounded-badge bg-lilac-dark" style={{ width: `${(f.count / maxFacility) * 100}%` }} />
                </div>
                <p className="w-8 shrink-0 text-right font-body text-xs font-bold text-text-primary">{f.count}</p>
                {f.criticalCount > 0 && (
                  <span className="shrink-0 rounded-badge bg-critical-bg px-2 py-0.5 font-body text-[11px] font-medium text-critical">
                    {f.criticalCount} critical
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-white p-4 shadow-card lg:p-5">
      <p className="font-body text-sm text-text-secondary">{label}</p>
      <p className="mt-1.5 font-heading text-2xl font-bold leading-none text-lilac-deeper lg:text-[28px]">{value}</p>
    </div>
  );
}
