import { prisma } from "@/lib/prisma";
import type { AppointmentRequestType, AppointmentStatus } from "@prisma/client";

export interface MidwifeAppointmentListItem {
  id: string;
  patientId: string;
  patientName: string;
  requestType: AppointmentRequestType;
  preferredDate: string;
  preferredTime: string | null;
  reason: string | null;
  notes: string | null;
  status: AppointmentStatus;
  createdAt: string;
}

export async function getMidwifeAppointments(facilityId: string): Promise<MidwifeAppointmentListItem[]> {
  const appointments = await prisma.appointmentRequest.findMany({
    where: { patient: { facilityId } },
    orderBy: [{ status: "asc" }, { preferredDate: "asc" }],
    include: { patient: { select: { id: true, name: true } } },
  });

  return appointments.map((a) => ({
    id: a.id,
    patientId: a.patient.id,
    patientName: a.patient.name,
    requestType: a.requestType,
    preferredDate: a.preferredDate.toISOString(),
    preferredTime: a.preferredTime,
    reason: a.reason,
    notes: a.notes,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));
}
