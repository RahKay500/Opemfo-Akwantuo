import { prisma } from "@/lib/prisma";
import type { DoctorInboxStatus } from "@/lib/queries/doctor-inbox";

// Authorization gate: a doctor may only view a patient they've actually been
// shared — checked by an existing ReferralShare row, not by facility (shares
// are deliberately cross-facility). No share row at all means no access,
// regardless of whether the share has since expired.
export async function getDoctorPatientDetail(patientId: string, doctorId: string) {
  const share = await prisma.referralShare.findFirst({
    where: { patientId, sharedWithDoctorId: doctorId },
    orderBy: { createdAt: "desc" },
    include: { sharedByNurse: { select: { name: true } } },
  });
  if (!share) return null;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      visits: { orderBy: { createdAt: "desc" }, include: { nurse: { select: { name: true } } } },
      referrals: { orderBy: { sentAt: "desc" }, include: { toFacility: { select: { name: true } } } },
    },
  });
  if (!patient) return null;

  const latestVisit = patient.visits[0] ?? null;

  // Same 3-state distinction as the inbox: isActive false means the doctor
  // explicitly reviewed it, separate from the 48h window simply lapsing.
  let status: DoctorInboxStatus = "Active";
  if (!share.isActive) status = "Reviewed";
  else if (share.expiresAt <= new Date()) status = "Expired";

  return { patient, latestVisit, share, status };
}

export type DoctorPatientDetail = NonNullable<Awaited<ReturnType<typeof getDoctorPatientDetail>>>;
