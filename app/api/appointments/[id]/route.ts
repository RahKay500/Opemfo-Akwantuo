import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { updateAppointmentStatusSchema } from "@/lib/validations/appointments";

function statusMessage(status: "CONFIRMED" | "DECLINED", requestType: string): string {
  if (status === "CONFIRMED") {
    return requestType === "GYNAECOLOGIST"
      ? "Your gynaecologist referral request has been confirmed. Your nurse will be in touch with next steps."
      : "Your appointment request has been confirmed.";
  }
  return "Your nurse wasn't able to confirm this request for the date given — please try a different date or speak with your nurse.";
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAppointmentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const appointment = await prisma.appointmentRequest.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });
  if (!appointment || appointment.patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Appointment request not found." }, { status: 404 });
  }
  if (appointment.status !== "PENDING") {
    return NextResponse.json({ error: `This request was already ${appointment.status.toLowerCase()}.` }, { status: 400 });
  }

  const updated = await prisma.appointmentRequest.update({
    where: { id: appointment.id },
    data: { status: parsed.data.status },
  });

  await logAudit({
    actorId: session.userId,
    action: "APPOINTMENT_STATUS_UPDATED",
    entityType: "AppointmentRequest",
    entityId: appointment.id,
    metadata: { from: "PENDING", to: parsed.data.status },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (appointment.patient.userId && appointment.patient.notifyAppointments) {
    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        type: "APPOINTMENT",
        title: parsed.data.status === "CONFIRMED" ? "Appointment confirmed" : "Appointment request declined",
        message: statusMessage(parsed.data.status, appointment.requestType),
        relatedId: appointment.id,
        relatedType: "AppointmentRequest",
      },
    });
  }

  return NextResponse.json({ appointment: updated });
}
