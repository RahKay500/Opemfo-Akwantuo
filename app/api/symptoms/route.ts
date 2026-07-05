import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { symptomSchema } from "@/lib/validations/symptoms";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (session.role !== "MOTHER") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  const symptoms = await prisma.symptom.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ symptoms });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = symptomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  const { symptoms, severity, notes, startedWhen } = parsed.data;

  const symptom = await prisma.symptom.create({
    data: {
      patientId: patient.id,
      reportedById: session.userId,
      symptoms,
      severity,
      notes,
      startedWhen,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "SYMPTOM_REPORTED",
    entityType: "Symptom",
    entityId: symptom.id,
    metadata: { severity, symptomCount: symptoms.length },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const midwives = await prisma.user.findMany({
    where: { facilityId: patient.facilityId, role: "MIDWIFE", isActive: true },
  });

  await prisma.notification.createMany({
    data: midwives.map((midwife) => ({
      userId: midwife.id,
      type: "SYMPTOM",
      title: "New symptom report",
      message: `${patient.name} reported ${severity.toLowerCase()} symptoms.`,
      relatedId: symptom.id,
      relatedType: "Symptom",
    })),
  });

  return NextResponse.json({ symptom });
}
