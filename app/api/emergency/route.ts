import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendEmergencyTriggeredSms } from "@/lib/hubtel";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  const alert = await prisma.emergencyAlert.create({
    data: { patientId: patient.id },
  });

  await logAudit({
    actorId: session.userId,
    action: "EMERGENCY_TRIGGERED",
    entityType: "EmergencyAlert",
    entityId: alert.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const midwives = await prisma.user.findMany({
    where: { facilityId: patient.facilityId, role: "MIDWIFE", isActive: true },
  });

  await prisma.notification.createMany({
    data: midwives.map((midwife) => ({
      userId: midwife.id,
      type: "EMERGENCY",
      title: "Emergency alert",
      message: `${patient.name} has triggered an emergency alert.`,
      relatedId: alert.id,
      relatedType: "EmergencyAlert",
    })),
  });

  for (const midwife of midwives) {
    await sendEmergencyTriggeredSms(midwife.phone, patient.emergencyContactPhone, patient.name);
  }

  return NextResponse.json({ alert });
}
