import { prisma } from "@/lib/prisma";
import type { Priority, ReferralStatus } from "@prisma/client";
import type { LifecycleStep } from "@/components/ui/LifecycleTracker";

export interface MotherReferralData {
  active: {
    id: string;
    hospitalName: string;
    hospitalPhone: string | null;
    priority: Priority;
    reason: string;
    referredByName: string;
    sentAt: Date;
    status: ReferralStatus;
    steps: LifecycleStep[];
  } | null;
  past: { id: string; hospitalName: string; date: Date; status: ReferralStatus }[];
}

function formatTimestamp(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString("en-GH", { day: "numeric", month: "short" }) +
    " · " +
    date.toLocaleTimeString("en-GH", { hour: "numeric", minute: "2-digit" });
}

function buildSteps(referral: {
  status: ReferralStatus;
  sentAt: Date;
  acknowledgedAt: Date | null;
  arrivedAt: Date | null;
}): LifecycleStep[] {
  const sent = formatTimestamp(referral.sentAt);
  const acknowledged = formatTimestamp(referral.acknowledgedAt);
  const arrived = formatTimestamp(referral.arrivedAt);

  const isAcknowledged = ["ACKNOWLEDGED", "PATIENT_ARRIVED", "COMPLETED"].includes(referral.status);
  const isArrived = ["PATIENT_ARRIVED", "COMPLETED"].includes(referral.status);

  return [
    { label: "Referral Sent", timestamp: sent, state: "done" },
    {
      label: "Hospital acknowledged",
      timestamp: acknowledged,
      state: isAcknowledged ? "done" : "current",
    },
    {
      label: "Head to the hospital",
      timestamp: isAcknowledged && !isArrived ? "Please proceed now" : null,
      state: isArrived ? "done" : isAcknowledged ? "current" : "pending",
    },
    {
      label: "Arrival confirmed",
      timestamp: arrived,
      state: isArrived ? "done" : "pending",
    },
  ];
}

export async function getMotherReferralData(userId: string): Promise<MotherReferralData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const [active, past] = await Promise.all([
    prisma.referral.findFirst({
      where: { patientId: patient.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      orderBy: { sentAt: "desc" },
      include: { toFacility: true, initiatedBy: { select: { name: true } } },
    }),
    prisma.referral.findMany({
      where: { patientId: patient.id, status: { in: ["COMPLETED", "CANCELLED"] } },
      orderBy: { sentAt: "desc" },
      include: { toFacility: { select: { name: true } } },
    }),
  ]);

  return {
    active: active
      ? {
          id: active.id,
          hospitalName: active.toFacility.name,
          hospitalPhone: active.toFacility.phone,
          priority: active.priority,
          reason: active.reason,
          referredByName: active.initiatedBy.name,
          sentAt: active.sentAt,
          status: active.status,
          steps: buildSteps(active),
        }
      : null,
    past: past.map((r) => ({
      id: r.id,
      hospitalName: r.toFacility.name,
      date: r.completedAt ?? r.sentAt,
      status: r.status,
    })),
  };
}
