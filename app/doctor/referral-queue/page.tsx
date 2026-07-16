import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorReferralQueue } from "@/lib/queries/doctor-referral-queue";
import { getDoctorSidebarData } from "@/lib/queries/doctor-sidebar";
import { initials } from "@/lib/utils";
import DoctorReferralQueueClient from "./DoctorReferralQueueClient";

export default async function DoctorReferralQueuePage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const [referrals, sidebarData] = await Promise.all([
    getDoctorReferralQueue(user.id),
    getDoctorSidebarData(user.id),
  ]);

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">Referral Queue</p>
        <p className="mt-1 font-body text-[13px] text-white">{sidebarData?.facilityName ?? ""}</p>
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Referral Queue</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(sidebarData?.name ?? "")}</span>
          </div>
        </div>
      </div>

      <DoctorReferralQueueClient referrals={referrals} />
    </main>
  );
}
