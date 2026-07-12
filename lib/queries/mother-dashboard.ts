import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress, type PregnancyProgress } from "@/lib/pregnancy";
import { THRESHOLDS } from "@/lib/flagging";

export interface MotherDashboardData {
  name: string;
  pregnancy: PregnancyProgress | null;
  dueDate: Date | null;
  bp: { systolic: number; diastolic: number; isNormal: boolean } | null;
  babyHeartRate: { value: number; isNormal: boolean } | null;
  nextAppointment: { date: Date; status: string; facilityName: string } | null;
  recentVisits: { id: string; date: Date; visitType: string; nurseName: string }[];
  recentNotifications: { id: string; type: string; title: string; message: string; createdAt: Date }[];
}

export async function getMotherDashboardData(userId: string): Promise<MotherDashboardData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId }, include: { facility: { select: { name: true } } } });
  if (!patient) return null;

  const [lastVisit, recentVisits, nextAppointment, recentNotifications] = await Promise.all([
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
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 2,
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
    dueDate: patient.edd,
    bp,
    babyHeartRate,
    nextAppointment: nextAppointment
      ? { date: nextAppointment.preferredDate, status: nextAppointment.status, facilityName: patient.facility.name }
      : null,
    recentVisits: recentVisits.map((visit) => ({
      id: visit.id,
      date: visit.createdAt,
      visitType: visit.visitType,
      nurseName: visit.nurse.name,
    })),
    recentNotifications: recentNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
    })),
  };
}
