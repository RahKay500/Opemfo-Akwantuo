import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import ReferralsClient from "./ReferralsClient";

// Platform-only oversight of every referral across all facilities — not a
// case-management tool (that's the midwife/doctor portals), just visibility.
export default async function AdminReferralsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const referrals = await prisma.referral.findMany({
    include: {
      patient: { select: { name: true } },
      fromFacility: { select: { name: true } },
      toFacility: { select: { name: true } },
    },
    orderBy: { sentAt: "desc" },
  });

  return (
    <>
      <Header title="Referrals" subtitle="All facilities" />
      <div className="px-4 py-6 lg:px-8">
        <ReferralsClient
          referrals={referrals.map((r) => ({
            id: r.id,
            patientName: r.patient.name,
            fromFacilityName: r.fromFacility.name,
            toFacilityName: r.toFacility.name,
            priority: r.priority,
            status: r.status,
            sentAt: r.sentAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
