import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { symptomSchema } from "@/lib/validations/symptoms";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = symptomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const symptom = await prisma.symptom.findUnique({ where: { id: params.id } });
  if (!symptom || symptom.reportedById !== session.userId) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (symptom.cancelledAt) {
    return NextResponse.json({ error: "This report has been cancelled." }, { status: 400 });
  }
  if (symptom.reviewedByNurseId) {
    return NextResponse.json({ error: "Your nurse has already reviewed this report — it can no longer be edited." }, { status: 400 });
  }

  const { symptoms, severity, notes, startedWhen } = parsed.data;
  const updated = await prisma.symptom.update({
    where: { id: symptom.id },
    data: { symptoms, severity, notes, startedWhen },
  });

  await logAudit({
    actorId: session.userId,
    action: "SYMPTOM_UPDATED",
    entityType: "Symptom",
    entityId: symptom.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ symptom: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const symptom = await prisma.symptom.findUnique({ where: { id: params.id } });
  if (!symptom || symptom.reportedById !== session.userId) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (symptom.cancelledAt) {
    return NextResponse.json({ error: "This report has already been cancelled." }, { status: 400 });
  }
  if (symptom.reviewedByNurseId) {
    return NextResponse.json({ error: "Your nurse has already reviewed this report — it can no longer be cancelled." }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: symptom.patientId } });
  const cancelled = await prisma.symptom.update({
    where: { id: symptom.id },
    data: { cancelledAt: new Date() },
  });

  await logAudit({
    actorId: session.userId,
    action: "SYMPTOM_CANCELLED",
    entityType: "Symptom",
    entityId: symptom.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (patient) {
    const midwives = await prisma.user.findMany({
      where: { facilityId: patient.facilityId, role: "MIDWIFE", isActive: true },
    });
    await prisma.notification.createMany({
      data: midwives.map((midwife) => ({
        userId: midwife.id,
        type: "SYMPTOM",
        title: "Symptom report cancelled",
        message: `${patient.name} cancelled a symptom report they sent earlier.`,
        relatedId: symptom.id,
        relatedType: "Symptom",
      })),
    });
  }

  return NextResponse.json({ symptom: cancelled });
}
