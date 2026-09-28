import { prisma } from "@/lib/prisma";
import type { LabRequestStatus } from "@prisma/client";

export interface LabRequestQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  notes: string | null;
  status: LabRequestStatus;
  eta: string | null;
  result: string | null;
  isAbnormal: boolean;
  requestedByName: string;
  requestedByRole: string;
  requestedAt: string;
}

export async function getLabRequestQueue(facilityId: string): Promise<LabRequestQueueItem[]> {
  const requests = await prisma.labRequest.findMany({
    where: { facilityId },
    include: { patient: { select: { name: true } }, requestedBy: { select: { name: true, role: true } } },
    orderBy: { requestedAt: "desc" },
  });

  return requests.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patient.name,
    testType: r.testType,
    notes: r.notes,
    status: r.status,
    eta: r.eta,
    result: r.result,
    isAbnormal: r.isAbnormal,
    requestedByName: r.requestedBy.name,
    requestedByRole: r.requestedBy.role === "DOCTOR" ? "Doctor" : "Midwife/Nurse",
    requestedAt: r.requestedAt.toISOString(),
  }));
}
