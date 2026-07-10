import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getMidwifeReferrals } from "@/lib/queries/midwife-referrals";
import ReferralQueueClient from "./ReferralQueueClient";

export default async function MidwifeReferralQueuePage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const facility = await prisma.facility.findUnique({ where: { id: user.facilityId } });
  const referrals = await getMidwifeReferrals(user.id);

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11">
        <p className="font-heading text-[22px] font-bold text-white">My Referrals</p>
        <p className="mt-1 font-body text-[13px] text-white">{facility?.name ?? ""}</p>
      </div>
      <ReferralQueueClient referrals={referrals} />
    </main>
  );
}
