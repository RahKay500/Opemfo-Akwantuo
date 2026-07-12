import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherRecordsData } from "@/lib/queries/mother-records";
import { cn, formatDate } from "@/lib/utils";
import BPGraphLoader from "@/components/ui/BPGraphLoader";

function visitTitle(visit: { visitType: string; gestationalAge: number | null; daysPostpartum: number | null }) {
  if (visit.visitType === "ANTENATAL" && visit.gestationalAge != null) return `Week ${visit.gestationalAge} visit`;
  if (visit.visitType === "POSTNATAL" && visit.daysPostpartum != null) return `Day ${visit.daysPostpartum} visit`;
  return visit.visitType === "ANTENATAL" ? "Antenatal visit" : "Postnatal visit";
}

function visitSummary(visit: {
  systolic: number | null;
  diastolic: number | null;
  fetalHeartRate: number | null;
  temperature: number | null;
}) {
  const parts: string[] = [];
  if (visit.systolic != null && visit.diastolic != null) parts.push(`BP ${visit.systolic}/${visit.diastolic}`);
  if (visit.fetalHeartRate != null) parts.push(`HR ${visit.fetalHeartRate} bpm`);
  if (visit.temperature != null) parts.push(`Temp ${visit.temperature}°C`);
  return parts.length > 0 ? parts.join(" · ") : "No vitals recorded";
}

export default async function MotherRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { type } = await searchParams;
  const visitType = type === "postnatal" ? "POSTNATAL" : "ANTENATAL";

  const data = await getMotherRecordsData(user.id, visitType);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          No patient record is linked to this account yet.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="border-b border-border-color bg-white px-5 pb-4 pt-14 text-center">
        <h1 className="font-heading text-xl font-bold text-text-primary">My Health Records</h1>
      </div>

      <div className="px-5 pt-3">
        <div className="flex rounded-badge bg-lilac-light p-1">
          <Link
            href="/mother/records?type=antenatal"
            className={cn(
              "flex-1 rounded-badge py-2.5 text-center font-heading text-sm font-bold",
              visitType === "ANTENATAL" ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
            )}
          >
            Antenatal
          </Link>
          <Link
            href="/mother/records?type=postnatal"
            className={cn(
              "flex-1 rounded-badge py-2.5 text-center font-heading text-sm font-bold",
              visitType === "POSTNATAL" ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
            )}
          >
            Postnatal
          </Link>
        </div>
      </div>

      <div className="px-5 pb-8 pt-5 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
        {data.bpTrend.length > 0 && (
          <div className="rounded-card bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[15px] font-bold text-text-primary">Blood Pressure Trend</h2>
              <span className="font-body text-xs text-text-secondary">Last {data.bpTrend.length} visits</span>
            </div>
            <div className="mt-4">
              <BPGraphLoader data={data.bpTrend} />
            </div>
            <div className="mt-3 flex justify-center gap-5">
              <span className="flex items-center gap-1.5 font-body text-xs text-text-secondary">
                <span className="size-3 rounded-badge bg-pink-deep" /> Systolic
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-text-secondary">
                <span className="size-3 rounded-badge bg-lilac-dark" /> Diastolic
              </span>
            </div>
          </div>
        )}

        {/* Mobile: full-width Visit History list, unchanged from before. */}
        <div className="mt-5 lg:hidden">
          <h2 className="font-heading text-[17px] font-bold text-text-primary">Visit History</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {data.visits.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>
            )}
            {data.visits.map((visit) => (
              <div key={visit.id} className="rounded-card bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="rounded-input border border-border-color px-2.5 py-1.5 font-body text-[13px] font-medium text-text-primary">
                    {formatDate(visit.date)}
                  </span>
                  <span className="rounded-badge bg-lilac-light px-2.5 py-1 font-body text-xs font-medium text-lilac-deeper">
                    {visit.visitType === "ANTENATAL" ? "Antenatal" : "Postnatal"}
                  </span>
                </div>
                <p className="mt-2 font-heading text-[15px] font-bold text-text-primary">{visitTitle(visit)}</p>
                <p className="mt-1 font-body text-xs text-text-secondary">{visitSummary(visit)}</p>
                <p className="mt-1 font-body text-xs text-[#9CA3AF]">Attended by {visit.nurseName}</p>
                {visit.flagged && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-[6px] bg-critical-bg px-2.5 py-1.5">
                    <span className="font-body text-xs text-critical">
                      Flag raised at this visit{visit.flagReason ? `: ${visit.flagReason}` : ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: compact right-column visit cards, matching Figma. */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          {data.visits.length === 0 && (
            <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>
          )}
          {data.visits.map((visit) => (
            <div
              key={visit.id}
              className={cn(
                "rounded-card border-l-4 bg-white p-4 shadow-card",
                visit.flagged ? "border-critical" : "border-transparent"
              )}
            >
              <p className="font-heading text-[13px] font-bold text-text-primary">{formatDate(visit.date)}</p>
              <div className="mt-2 flex gap-2">
                <div
                  className={cn(
                    "flex-1 rounded-input p-2 text-center",
                    visit.flagged ? "bg-critical-bg" : "bg-lilac-light"
                  )}
                >
                  <p className="font-body text-[10px] text-text-secondary">BP</p>
                  <p className={cn("font-heading text-sm font-bold", visit.flagged ? "text-critical" : "text-text-primary")}>
                    {visit.systolic != null && visit.diastolic != null ? `${visit.systolic}/${visit.diastolic}` : "—"}
                  </p>
                </div>
                <div className="flex-1 rounded-input bg-lilac-light p-2 text-center">
                  <p className="font-body text-[10px] text-text-secondary">Weight</p>
                  <p className="font-heading text-sm font-bold text-text-primary">
                    {visit.weight != null ? `${visit.weight}kg` : "—"}
                  </p>
                </div>
                <div className="flex-1 rounded-input bg-lilac-light p-2 text-center">
                  <p className="font-body text-[10px] text-text-secondary">Fetal HR</p>
                  <p className="font-heading text-sm font-bold text-text-primary">
                    {visit.fetalHeartRate != null ? `${visit.fetalHeartRate} bpm` : "—"}
                  </p>
                </div>
              </div>
              {visit.flagged && (
                <p className="mt-2 font-body text-xs text-critical">
                  ⚠ {visit.flagReason ?? "Flagged for review"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
