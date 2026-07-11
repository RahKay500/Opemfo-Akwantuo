import { prisma } from "@/lib/prisma";

export async function getMidwifePatientDetail(patientId: string, midwifeFacilityId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      visits: { orderBy: { createdAt: "desc" }, include: { nurse: { select: { name: true } } } },
      referrals: {
        orderBy: { sentAt: "desc" },
        include: { toFacility: { select: { name: true } }, initiatedBy: { select: { name: true } } },
      },
      vaccinations: { orderBy: { dateGiven: "desc" } },
      iptpDoses: { orderBy: { dateGiven: "desc" } },
      deliveryRecord: true,
    },
  });

  if (!patient || patient.facilityId !== midwifeFacilityId) return null;

  const latestVisit = patient.visits[0] ?? null;
  const activeReferral = patient.referrals.find((r) => !["COMPLETED", "CANCELLED"].includes(r.status)) ?? null;

  return { patient, latestVisit, activeReferral };
}

export type MidwifePatientDetail = NonNullable<Awaited<ReturnType<typeof getMidwifePatientDetail>>>;
