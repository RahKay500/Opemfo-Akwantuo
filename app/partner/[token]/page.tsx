import { getPartnerViewData } from "@/lib/queries/partner-view";
import { formatDate } from "@/lib/utils";
import ProgressRing from "@/components/ui/ProgressRing";
import { HeartRateIcon, BPIcon, FlagIcon, PatientsIcon } from "@/components/ui/icons";

export default async function PartnerViewPage({ params }: { params: { token: string } }) {
  const data = await getPartnerViewData(params.token);

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#F6F1F8] p-6 text-center">
        <p className="font-heading text-lg font-bold text-text-primary">Link no longer active</p>
        <p className="font-body text-sm text-text-secondary">
          This link is no longer active. Ask them to share a new one.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F6F1F8] px-5 pb-10 pt-14">
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex size-14 items-center justify-center rounded-badge bg-lilac-light">
          <HeartRateIcon className="size-6 text-lilac-deeper" />
        </div>
        <p className="mt-2 font-heading text-xl font-bold text-text-primary">{data.patientName}&apos;s pregnancy journey</p>
        <p className="font-body text-sm text-text-secondary">Shared with you as a partner</p>
      </div>

      {data.pregnancy && (
        <div className="mt-6 rounded-card bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-heading text-4xl font-bold text-lilac-dark">Week {data.pregnancy.week}</p>
              <p className="mt-0.5 font-body text-[13px] text-text-secondary">{data.pregnancy.trimester} trimester</p>
            </div>
            <ProgressRing percent={data.pregnancy.progressPercent} />
          </div>
          <p className="mt-3 text-center font-body text-xs text-text-secondary">
            {data.pregnancy.weeksToGo} weeks to go
          </p>
        </div>
      )}

      {data.permissions.shareAppointments && (
        <div className="mt-4 rounded-card bg-white p-5 shadow-card">
          <p className="font-body text-xs text-text-secondary">Next Visit</p>
          <p className="mt-1 font-heading text-lg font-bold text-text-primary">
            {data.nextAppointment ? formatDate(data.nextAppointment.date) : "None scheduled"}
          </p>
        </div>
      )}

      {data.permissions.shareVitals && data.latestVisit && (
        <div className="mt-4 rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <BPIcon className="size-4 text-lilac-deeper" />
            <p className="font-body text-xs text-text-secondary">Latest vitals · {formatDate(data.latestVisit.createdAt)}</p>
          </div>
          <div className="mt-3 flex gap-4">
            <div className="flex-1">
              <p className="font-body text-[11px] text-text-secondary">BP</p>
              <p className="font-heading text-base font-bold text-text-primary">
                {data.latestVisit.systolic && data.latestVisit.diastolic
                  ? `${data.latestVisit.systolic}/${data.latestVisit.diastolic}`
                  : "—"}
              </p>
            </div>
            <div className="flex-1">
              <p className="font-body text-[11px] text-text-secondary">Baby HR</p>
              <p className="font-heading text-base font-bold text-text-primary">
                {data.latestVisit.fetalHeartRate ? `${data.latestVisit.fetalHeartRate} bpm` : "—"}
              </p>
            </div>
            <div className="flex-1">
              <p className="font-body text-[11px] text-text-secondary">Weight</p>
              <p className="font-heading text-base font-bold text-text-primary">
                {data.latestVisit.weight ? `${data.latestVisit.weight}kg` : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {data.permissions.shareVisitSummaries && data.recentVisits.length > 0 && (
        <div className="mt-4 rounded-card bg-white p-5 shadow-card">
          <p className="font-body text-xs text-text-secondary">Recent visits</p>
          <div className="mt-2 flex flex-col gap-3">
            {data.recentVisits.map((v, i) => (
              <div key={i} className="border-b border-border-color pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm font-bold text-text-primary">
                    {v.visitType === "ANTENATAL" ? "Antenatal visit" : "Postnatal visit"}
                  </p>
                  <p className="font-body text-xs text-text-secondary">{formatDate(v.createdAt)}</p>
                </div>
                {v.observations && <p className="mt-1 font-body text-xs text-text-secondary">{v.observations}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.permissions.shareReferralStatus && (
        <div className="mt-4 rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <FlagIcon className="size-4 text-lilac-deeper" />
            <p className="font-body text-xs text-text-secondary">Referral status</p>
          </div>
          {data.activeReferral ? (
            <>
              <p className="mt-1 font-heading text-base font-bold text-text-primary">{data.activeReferral.hospitalName}</p>
              <p className="mt-0.5 font-body text-xs text-text-secondary">
                {data.activeReferral.status.replace(/_/g, " ")} · {data.activeReferral.priority} priority
              </p>
            </>
          ) : (
            <p className="mt-1 font-body text-sm text-text-secondary">No active referral.</p>
          )}
        </div>
      )}

      {data.permissions.shareMedicalHistory && data.medicalHistory && (
        <div className="mt-4 rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <PatientsIcon className="size-4 text-lilac-deeper" />
            <p className="font-body text-xs text-text-secondary">Medical history</p>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            <p className="font-body text-sm text-text-primary">
              Blood group: <span className="text-text-secondary">{data.medicalHistory.bloodGroup ?? "Not recorded"}</span>
            </p>
            <p className="font-body text-sm text-text-primary">
              Known conditions: <span className="text-text-secondary">{data.medicalHistory.knownConditions ?? "None recorded"}</span>
            </p>
            {data.medicalHistory.majorRiskFactors.length > 0 && (
              <p className="font-body text-sm text-text-primary">
                Risk factors: <span className="text-text-secondary">{data.medicalHistory.majorRiskFactors.join(", ")}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
