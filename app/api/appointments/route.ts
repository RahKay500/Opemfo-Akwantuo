import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { appointmentRequestSchema } from "@/lib/validations/appointments";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  const appointments = await prisma.appointmentRequest.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = appointmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  const { requestType, preferredDate, preferredTime, reason, notes } = parsed.data;

  const appointment = await prisma.appointmentRequest.create({
    data: {
      patientId: patient.id,
      requestType,
      preferredDate: new Date(preferredDate),
      preferredTime,
      reason,
      notes,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "APPOINTMENT_REQUESTED",
    entityType: "AppointmentRequest",
    entityId: appointment.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const midwives = await prisma.user.findMany({
    where: { facilityId: patient.facilityId, role: "MIDWIFE", isActive: true },
  });

  await prisma.notification.createMany({
    data: midwives.map((midwife) => ({
      userId: midwife.id,
      type: "APPOINTMENT",
      title: "New appointment request",
      message: `${patient.name} requested ${requestType === "GYNAECOLOGIST" ? "a gynaecologist consultation" : "an appointment"}.`,
      relatedId: appointment.id,
      relatedType: "AppointmentRequest",
    })),
  });

  return NextResponse.json({ appointment });
}
