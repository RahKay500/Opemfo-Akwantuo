import { getPartnerViewData } from "@/lib/queries/partner-view";
import { formatDate } from "@/lib/utils";
import ProgressRing from "@/components/ui/ProgressRing";
import { HeartRateIcon } from "@/components/ui/icons";

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

      <div className="mt-4 rounded-card bg-white p-5 shadow-card">
        <p className="font-body text-xs text-text-secondary">Next Visit</p>
        <p className="mt-1 font-heading text-lg font-bold text-text-primary">
          {data.nextAppointment ? formatDate(data.nextAppointment.date) : "None scheduled"}
        </p>
      </div>
    </main>
  );
}
