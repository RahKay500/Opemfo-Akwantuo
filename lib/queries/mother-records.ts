import { prisma } from "@/lib/prisma";
import type { VisitType } from "@prisma/client";

export interface MotherRecordsVisit {
  id: string;
  date: Date;
  visitType: VisitType;
  gestationalAge: number | null;
  daysPostpartum: number | null;
  systolic: number | null;
  diastolic: number | null;
  fetalHeartRate: number | null;
  temperature: number | null;
  weight: number | null;
  nurseName: string;
  flagged: boolean;
  flagReason: string | null;
}

export interface MotherRecordsData {
  patientId: string;
  visits: MotherRecordsVisit[];
  bpTrend: { date: string; systolic: number; diastolic: number }[];
}

export async function getMotherRecordsData(
  userId: string,
  visitType: VisitType
): Promise<MotherRecordsData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const visits = await prisma.visit.findMany({
    where: { patientId: patient.id, visitType },
    orderBy: { createdAt: "desc" },
    include: { nurse: { select: { name: true } } },
  });

  const bpTrend = visits
    .filter((v) => v.systolic != null && v.diastolic != null)
    .slice(0, 5)
    .reverse()
    .map((v) => ({
      date: v.createdAt.toLocaleDateString("en-GH", { month: "short", day: "numeric" }),
      systolic: v.systolic!,
      diastolic: v.diastolic!,
    }));

  return {
    patientId: patient.id,
    visits: visits.map((v) => ({
      id: v.id,
      date: v.createdAt,
      visitType: v.visitType,
      gestationalAge: v.gestationalAge,
      daysPostpartum: v.daysPostpartum,
      systolic: v.systolic,
      diastolic: v.diastolic,
      fetalHeartRate: v.fetalHeartRate,
      temperature: v.temperature,
      weight: v.weight,
      nurseName: v.nurse.name,
      flagged: v.flagged,
      flagReason: v.flagReason,
    })),
    bpTrend,
  };
}
