import { prisma } from "@/lib/prisma";
import type { LabRequestStatus } from "@prisma/client";

export interface MyLabRequestItem {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  status: LabRequestStatus;
  eta: string | null;
  result: string | null;
  isAbnormal: boolean;
  requestedAt: string;
  completedAt: string | null;
}

export async function getMyLabRequests(userId: string): Promise<MyLabRequestItem[]> {
  const requests = await prisma.labRequest.findMany({
    where: { requestedById: userId },
    include: { patient: { select: { name: true } } },
    orderBy: { requestedAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patient.name,
    testType: r.testType,
    status: r.status,
    eta: r.eta,
    result: r.result,
    isAbnormal: r.isAbnormal,
    requestedAt: r.requestedAt.toISOString(),
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
  }));
}
