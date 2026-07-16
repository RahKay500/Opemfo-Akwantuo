import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorAnalyticsData } from "@/lib/queries/doctor-analytics";
import { getDoctorSidebarData } from "@/lib/queries/doctor-sidebar";
import { initials } from "@/lib/utils";
import MonthlyReferralsChartLoader from "@/components/ui/MonthlyReferralsChartLoader";

const REASON_COLOR: Record<string, string> = {
  "Pre-eclampsia": "bg-critical",
  "Gestational Diabetes": "bg-high",
  Anaemia: "bg-lilac-mid",
  "Preterm Labour": "bg-pink-accent",
  Other: "bg-[#9CA3AF]",
};

export default async function DoctorAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [data, sidebarData] = await Promise.all([
    getDoctorAnalyticsData(user.id),
    getDoctorSidebarData(user.id),
  ]);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  const maxFacility = Math.max(...data.byFacility.map((f) => f.count), 1);
  const deltaLabel =
    data.referralsDeltaVsLastMonth === 0
      ? "Same as last month"
      : `${data.referralsDeltaVsLastMonth > 0 ? "+" : ""}${data.referralsDeltaVsLastMonth} vs last month`;

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
        <div className="flex items-center gap-3">
          {sidebarData && sidebarData.newSharedRecordsCount > 0 && (
            <span className="rounded-badge bg-pink-light px-3 py-1.5 font-body text-[13px] font-bold text-pink-deep">
              {sidebarData.newSharedRecordsCount} shared record{sidebarData.newSharedRecordsCount === 1 ? "" : "s"} pending review
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(sidebarData?.name ?? "")}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-8 pt-5 lg:gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatTile
            label="Referrals This Month"
            value={String(data.referralsThisMonth)}
            valueColor="text-lilac-deeper"
            caption={deltaLabel}
          />
          <StatTile
            label="Avg Response Time"
            value={data.avgResponseTimeLabel ?? "—"}
            valueColor="text-[#16A34A]"
            caption="Target: ≤6h"
          />
          <StatTile
            label="Critical Cases"
            value={String(data.criticalCasesThisMonth)}
            valueColor="text-critical"
            caption="This month"
          />
          <StatTile
            label="Outcomes Recorded"
            value={String(data.outcomesRecordedThisMonth)}
            caption={data.outcomesRecordedPercent != null ? `${data.outcomesRecordedPercent}% of referrals` : "No referrals yet"}
          />
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-6">
          <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
            <h2 className="font-heading text-lg font-bold text-text-primary">6-Month Referral Trend</h2>
            <div className="mt-3">
              <MonthlyReferralsChartLoader data={data.monthlyReferrals} />
            </div>
          </div>

          <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
            <h2 className="font-heading text-lg font-bold text-text-primary">Referral Reasons</h2>
            {data.reasonBreakdown.length === 0 ? (
              <p className="mt-4 font-body text-sm text-text-secondary">No referrals received yet.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {data.reasonBreakdown.map((r) => (
                  <div key={r.category}>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm text-text-primary">{r.category}</p>
                      <p className="font-body text-sm font-bold text-text-primary">{r.percent}%</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-badge bg-[#F3F4F6]">
                      <div
                        className={`h-full rounded-badge ${REASON_COLOR[r.category] ?? "bg-[#9CA3AF]"}`}
                        style={{ width: `${r.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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

function StatTile({
  label,
  value,
  valueColor = "text-text-primary",
  caption,
}: {
  label: string;
  value: string;
  valueColor?: string;
  caption: string;
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-card lg:p-5">
      <p className="font-body text-sm text-text-secondary">{label}</p>
      <p className={`mt-1.5 font-heading text-2xl font-bold leading-none lg:text-[28px] ${valueColor}`}>{value}</p>
      <p className="mt-1.5 font-body text-xs text-text-secondary">{caption}</p>
    </div>
  );
}
