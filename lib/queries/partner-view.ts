import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress, type PregnancyProgress } from "@/lib/pregnancy";

export interface PartnerViewData {
  patientName: string;
  pregnancy: PregnancyProgress | null;
  nextAppointment: { date: Date } | null;
}

export async function getPartnerViewData(token: string): Promise<PartnerViewData | null> {
  const link = await prisma.partnerLink.findUnique({
    where: { token },
    include: { patient: true },
  });
  if (!link || link.revokedAt) return null;

  const nextAppointment = await prisma.appointmentRequest.findFirst({
    where: { patientId: link.patientId, status: "CONFIRMED", preferredDate: { gte: new Date() } },
    orderBy: { preferredDate: "asc" },
  });

  return {
    patientName: link.patient.name,
    pregnancy: link.patient.lmp ? calculatePregnancyProgress(link.patient.lmp) : null,
    nextAppointment: nextAppointment ? { date: nextAppointment.preferredDate } : null,
  };
}
