import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress, type PregnancyProgress } from "@/lib/pregnancy";
import { THRESHOLDS } from "@/lib/flagging";

export interface MotherDashboardData {
  name: string;
  pregnancy: PregnancyProgress | null;
  bp: { systolic: number; diastolic: number; isNormal: boolean } | null;
  babyHeartRate: { value: number; isNormal: boolean } | null;
  nextAppointment: { date: Date; status: string } | null;
  recentVisits: { id: string; date: Date; visitType: string; nurseName: string }[];
}

export async function getMotherDashboardData(userId: string): Promise<MotherDashboardData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const [lastVisit, recentVisits, nextAppointment] = await Promise.all([
    prisma.visit.findFirst({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.visit.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: { nurse: { select: { name: true } } },
    }),
    prisma.appointmentRequest.findFirst({
      where: { patientId: patient.id, status: "CONFIRMED", preferredDate: { gte: new Date() } },
      orderBy: { preferredDate: "asc" },
    }),
  ]);

  const pregnancy = patient.lmp ? calculatePregnancyProgress(patient.lmp) : null;

  const bp =
    lastVisit?.systolic != null && lastVisit?.diastolic != null
      ? {
          systolic: lastVisit.systolic,
          diastolic: lastVisit.diastolic,
          isNormal:
            lastVisit.systolic < THRESHOLDS.systolic.high && lastVisit.diastolic < THRESHOLDS.diastolic.high,
        }
      : null;

  const babyHeartRate =
    lastVisit?.fetalHeartRate != null
      ? {
          value: lastVisit.fetalHeartRate,
          isNormal:
            lastVisit.fetalHeartRate >= THRESHOLDS.fetalHeartRate.low &&
            lastVisit.fetalHeartRate <= THRESHOLDS.fetalHeartRate.high,
        }
      : null;

  return {
    name: patient.name,
    pregnancy,
    bp,
    babyHeartRate,
    nextAppointment: nextAppointment
      ? { date: nextAppointment.preferredDate, status: nextAppointment.status }
      : null,
    recentVisits: recentVisits.map((visit) => ({
      id: visit.id,
      date: visit.createdAt,
      visitType: visit.visitType,
      nurseName: visit.nurse.name,
    })),
  };
}
