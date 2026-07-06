import { prisma } from "@/lib/prisma";

export type DoctorInboxStatus = "Active" | "Reviewed" | "Expired";

export interface DoctorInboxItem {
  id: string;
  patientId: string;
  patientName: string;
  sharedByName: string;
  facilityName: string;
  reason: string;
  status: DoctorInboxStatus;
  expiresAt: string;
  createdAt: string;
  flagged: boolean;
}

export async function getDoctorInbox(userId: string): Promise<DoctorInboxItem[]> {
  const shares = await prisma.referralShare.findMany({
    where: { sharedWithDoctorId: userId, patientId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: {
      patient: {
        include: {
          facility: { select: { name: true } },
          visits: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      sharedByNurse: { select: { name: true } },
    },
  });

  const now = new Date();

  return shares
    .filter((s) => s.patient)
    .map((s) => {
      // isActive is repurposed as "not yet reviewed" — false here means the
      // doctor explicitly marked it reviewed (PATCH /api/referral-shares/[id]),
      // distinct from the 48h window simply running out unreviewed.
      let status: DoctorInboxStatus = "Active";
      if (!s.isActive) status = "Reviewed";
      else if (s.expiresAt <= now) status = "Expired";

      return {
        id: s.id,
        patientId: s.patient!.id,
        patientName: s.patient!.name,
        sharedByName: s.sharedByNurse.name,
        facilityName: s.patient!.facility.name,
        reason: s.reason ?? "Consultation requested",
        status,
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        flagged: s.patient!.visits[0]?.flagged ?? false,
      };
    });
}
