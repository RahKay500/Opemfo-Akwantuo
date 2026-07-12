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
  bpTrend: { visit: string; systolic: number; diastolic: number }[];
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

  // Number chronologically (V1 = earliest visit) across the full history before
  // slicing to the most recent 5, so labels stay correct even when older
  // visits are trimmed off — e.g. a patient on visit 8 sees "V4"–"V8", not a
  // relabeled "V1"–"V5".
  const bpTrend = visits
    .filter((v) => v.systolic != null && v.diastolic != null)
    .slice()
    .reverse()
    .map((v, i) => ({
      visit: `V${i + 1}`,
      systolic: v.systolic!,
      diastolic: v.diastolic!,
    }))
    .slice(-5);

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
