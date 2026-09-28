import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { resolveEmergencyAlertSchema } from "@/lib/validations/emergency";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resolveEmergencyAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const alert = await prisma.emergencyAlert.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });
  if (!alert || alert.patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Emergency alert not found." }, { status: 404 });
  }
  if (!alert.isActive) {
    return NextResponse.json({ error: "This alert has already been resolved." }, { status: 400 });
  }

  const updated = await prisma.emergencyAlert.update({
    where: { id: alert.id },
    data: {
      isActive: false,
      resolvedAt: new Date(),
      resolvedById: session.userId,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "EMERGENCY_RESOLVED",
    entityType: "EmergencyAlert",
    entityId: alert.id,
    metadata: { patientId: alert.patientId },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ alert: updated });
}
