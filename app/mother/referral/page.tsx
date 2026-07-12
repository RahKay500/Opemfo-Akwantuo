import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherReferralData } from "@/lib/queries/mother-referral";
import { formatDate } from "@/lib/utils";
import PriorityBadge from "@/components/ui/PriorityBadge";
import LifecycleTracker from "@/components/ui/LifecycleTracker";
import { PhoneCallIcon } from "@/components/ui/icons";

export default async function MotherReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMotherReferralData(user.id);
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
      <div className="px-5 pb-4 pt-14 text-center lg:pb-0 lg:pt-8 lg:text-left">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Referral Status</h1>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-8 pt-5 lg:max-w-2xl">
        {data.active ? (
          <>
            <div className="rounded-card bg-white p-5 shadow-card">
              <p className="font-body text-[11px] font-medium tracking-[0.06em] text-text-secondary">
                ACTIVE REFERRAL
              </p>
              <p className="mt-2 font-heading text-xl font-bold text-text-primary">{data.active.hospitalName}</p>
              <div className="mt-4">
                <PriorityBadge priority={data.active.priority} />
              </div>
              <div className="mt-4 border-t border-border-color pt-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="font-body text-xs font-medium text-text-secondary">Referred by</p>
                    <p className="mt-1 font-body text-sm text-text-primary">{data.active.referredByName}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-xs font-medium text-text-secondary">Date</p>
                    <p className="mt-1 font-body text-sm text-text-primary">{formatDate(data.active.sentAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-card bg-white p-5 shadow-card">
              <h2 className="font-heading text-[15px] font-bold text-text-primary">Referral Progress</h2>
              <div className="mt-5">
                <LifecycleTracker steps={data.active.steps} />
              </div>
            </div>

            <div className="rounded-card bg-white p-4 shadow-card lg:flex lg:items-center lg:justify-between lg:gap-4 lg:p-5">
              <div>
                <p className="font-body text-xs font-medium text-text-secondary">Hospital contact</p>
                <p className="mt-1 font-heading text-[15px] font-bold text-text-primary">{data.active.hospitalName}</p>
                {data.active.hospitalPhone && (
                  <p className="mt-1 font-body text-sm text-text-secondary">{data.active.hospitalPhone}</p>
                )}
              </div>
              {data.active.hospitalPhone && (
                <a
                  href={`tel:${data.active.hospitalPhone}`}
                  className="mt-3.5 flex h-12 items-center justify-center gap-2 rounded-input bg-lilac-light px-6 font-body text-sm font-bold text-lilac-deeper lg:mt-0 lg:shrink-0"
                >
                  <PhoneCallIcon className="size-4" />
                  Call Hospital
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-card bg-white p-6 text-center shadow-card">
            <p className="font-body text-sm text-text-secondary">You have no active referral right now.</p>
          </div>
        )}

        {data.past.length > 0 && (
          <div>
            <h2 className="font-heading text-[17px] font-bold text-text-primary">Past referrals</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {data.past.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between rounded-card bg-white p-3.5 shadow-card"
                >
                  <div>
                    <p className="font-heading text-sm font-bold text-text-primary">{referral.hospitalName}</p>
                    <p className="mt-0.5 font-body text-xs text-text-secondary">{formatDate(referral.date)}</p>
                  </div>
                  <span className="rounded-badge bg-[#F0FDF4] px-2.5 py-1 font-body text-xs font-medium text-[#16A34A]">
                    {referral.status === "COMPLETED" ? "Completed" : "Cancelled"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
