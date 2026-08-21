import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeReferrals } from "@/lib/queries/midwife-referrals";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";
import { shortFacilityName } from "@/lib/utils";
import IdentityMenu from "@/components/ui/IdentityMenu";
import ReferralQueueClient from "./ReferralQueueClient";

export default async function MidwifeReferralQueuePage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const [referrals, sidebarData] = await Promise.all([
    getMidwifeReferrals(user.id),
    getMidwifeSidebarData(user.id),
  ]);

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">My Referrals</p>
        <p className="mt-1 font-body text-[13px] text-white">{sidebarData?.facilityName ?? ""}</p>
      </div>

      <div className="hidden items-center justify-between rounded-card bg-white px-6 py-5 border border-border-color lg:mx-5 lg:mt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Referrals</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {sidebarData?.activeEmergency && (
            <span className="flex items-center gap-1.5 rounded-badge bg-critical-bg px-3 py-1.5 font-body text-[13px] font-bold text-critical">
              <span className="size-1.5 rounded-badge bg-critical" />1 Emergency
            </span>
          )}
          {sidebarData?.name && (
            <IdentityMenu
              name={sidebarData.name}
              subtitle={sidebarData.facilityName ? `${shortFacilityName(sidebarData.facilityName)} · Midwife` : null}
              profileHref="/midwife/profile"
              avatarSize="sm"
            />
          )}
        </div>
      </div>

      <ReferralQueueClient referrals={referrals} />
    </main>
  );
}
