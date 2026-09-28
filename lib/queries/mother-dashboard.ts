import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress, type PregnancyProgress } from "@/lib/pregnancy";
import { THRESHOLDS } from "@/lib/flagging";

export interface MotherDashboardData {
  name: string;
  pregnancy: PregnancyProgress | null;
  dueDate: Date | null;
  bp: { systolic: number; diastolic: number; isNormal: boolean } | null;
  babyHeartRate: { value: number; isNormal: boolean } | null;
  nextAppointment: { date: Date; status: string; facilityName: string; source: "doctor" | "midwife" | "self" } | null;
  recentVisits: { id: string; date: Date; visitType: string; nurseName: string }[];
  recentNotifications: { id: string; type: string; title: string; message: string; createdAt: Date; isRead: boolean }[];
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

  // Precedence: a Doctor's clinical override > the midwife's own "Date of
  // Next Visit" (set when logging the latest visit) > the mother's
  // self-service booking — each step up reflects more authoritative
  // clinical guidance than the one below it.
  const doctorNextVisit =
    patient.doctorNextVisitOverride && patient.doctorNextVisitOverride.getTime() >= Date.now()
      ? patient.doctorNextVisitOverride
      : null;
  const midwifeNextVisit =
    lastVisit?.nextVisitDate && lastVisit.nextVisitDate.getTime() >= Date.now() ? lastVisit.nextVisitDate : null;

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
    nextAppointment: doctorNextVisit
      ? { date: doctorNextVisit, status: "CONFIRMED", facilityName: patient.facility.name, source: "doctor" }
      : midwifeNextVisit
        ? { date: midwifeNextVisit, status: "CONFIRMED", facilityName: patient.facility.name, source: "midwife" }
        : nextAppointment
          ? { date: nextAppointment.preferredDate, status: nextAppointment.status, facilityName: patient.facility.name, source: "self" }
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
      isRead: n.isRead,
    })),
  };
}
