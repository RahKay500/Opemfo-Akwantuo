import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress, type PregnancyProgress } from "@/lib/pregnancy";

export interface PartnerViewData {
  patientName: string;
  pregnancy: PregnancyProgress | null;
  nextAppointment: { date: Date } | null;
  latestVisit: { weight: number | null; fetalHeartRate: number | null; systolic: number | null; diastolic: number | null; createdAt: Date } | null;
  recentVisits: { visitType: string; createdAt: Date; observations: string | null }[];
  activeReferral: { hospitalName: string; status: string; priority: string } | null;
  medicalHistory: { bloodGroup: string | null; knownConditions: string | null; majorRiskFactors: string[] } | null;
  permissions: {
    shareProgress: boolean;
    shareAppointments: boolean;
    shareVitals: boolean;
    shareVisitSummaries: boolean;
    shareReferralStatus: boolean;
    shareMedicalHistory: boolean;
  };
}

export async function getPartnerViewData(token: string): Promise<PartnerViewData | null> {
  const link = await prisma.partnerLink.findUnique({
    where: { token },
    include: { patient: true },
  });
  if (!link || link.revokedAt) return null;

  const permissions = {
    shareProgress: link.shareProgress,
    shareAppointments: link.shareAppointments,
    shareVitals: link.shareVitals,
    shareVisitSummaries: link.shareVisitSummaries,
    shareReferralStatus: link.shareReferralStatus,
    shareMedicalHistory: link.shareMedicalHistory,
  };

  const [nextAppointment, midwifeSetVisit, latestVisit, recentVisits, activeReferral] = await Promise.all([
    permissions.shareAppointments
      ? prisma.appointmentRequest.findFirst({
          where: { patientId: link.patientId, status: "CONFIRMED", preferredDate: { gte: new Date() } },
          orderBy: { preferredDate: "asc" },
        })
      : null,
    permissions.shareAppointments
      ? prisma.visit.findFirst({ where: { patientId: link.patientId }, orderBy: { createdAt: "desc" } })
      : null,
    permissions.shareVitals
      ? prisma.visit.findFirst({ where: { patientId: link.patientId }, orderBy: { createdAt: "desc" } })
      : null,
    permissions.shareVisitSummaries
      ? prisma.visit.findMany({
          where: { patientId: link.patientId },
          orderBy: { createdAt: "desc" },
          take: 3,
        })
      : [],
    permissions.shareReferralStatus
      ? prisma.referral.findFirst({
          where: { patientId: link.patientId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
          orderBy: { sentAt: "desc" },
          include: { toFacility: { select: { name: true } } },
        })
      : null,
  ]);

  return {
    patientName: link.patient.name,
    pregnancy: permissions.shareProgress && link.patient.lmp ? calculatePregnancyProgress(link.patient.lmp) : null,
    nextAppointment:
      midwifeSetVisit?.nextVisitDate && midwifeSetVisit.nextVisitDate.getTime() >= Date.now()
        ? { date: midwifeSetVisit.nextVisitDate }
        : nextAppointment
          ? { date: nextAppointment.preferredDate }
          : null,
    latestVisit: latestVisit
      ? {
          weight: latestVisit.weight,
          fetalHeartRate: latestVisit.fetalHeartRate,
          systolic: latestVisit.systolic,
          diastolic: latestVisit.diastolic,
          createdAt: latestVisit.createdAt,
        }
      : null,
    recentVisits: recentVisits.map((v) => ({
      visitType: v.visitType,
      createdAt: v.createdAt,
      observations: v.observations,
    })),
    activeReferral: activeReferral
      ? { hospitalName: activeReferral.toFacility.name, status: activeReferral.status, priority: activeReferral.priority }
      : null,
    medicalHistory: permissions.shareMedicalHistory
      ? {
          bloodGroup: link.patient.bloodGroup,
          knownConditions: link.patient.knownConditions,
          majorRiskFactors: link.patient.majorRiskFactors,
        }
      : null,
    permissions,
  };
}
