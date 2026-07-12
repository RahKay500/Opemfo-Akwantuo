import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { logVisitSchema } from "@/lib/validations/visits";
import { evaluateVitals } from "@/lib/flagging";
import { calculatePregnancyProgress } from "@/lib/pregnancy";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const visits = await prisma.visit.findMany({
    where: { patientId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ visits });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = logVisitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const { visitType, systolic, diastolic, fetalHeartRate, temperature, weight, fundalHeight, observations, nextVisitDate } =
    parsed.data;

  const gestationalAge =
    visitType === "ANTENATAL" && patient.lmp ? calculatePregnancyProgress(patient.lmp).week : null;
  const daysPostpartum =
    visitType === "POSTNATAL" && patient.deliveryDate
      ? Math.floor((Date.now() - patient.deliveryDate.getTime()) / (24 * 60 * 60 * 1000))
      : null;

  const flagResult = evaluateVitals({ systolic, diastolic, fetalHeartRate, temperature });

  const visit = await prisma.visit.create({
    data: {
      patientId: patient.id,
      nurseId: session.userId,
      visitType,
      gestationalAge,
      daysPostpartum,
      systolic,
      diastolic,
      fetalHeartRate,
      temperature,
      weight,
      fundalHeight,
      observations,
      nextVisitDate,
      flagged: flagResult.flagged,
      flagReason: flagResult.flagged ? flagResult.reason : null,
      flagPriority: flagResult.priority,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "VISIT_LOGGED",
    entityType: "Visit",
    entityId: visit.id,
    metadata: { flagged: flagResult.flagged, priority: flagResult.priority },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (flagResult.flagged && patient.userId) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "VITALS",
        title: systolic && diastolic && (systolic >= 140 || diastolic >= 90) ? "High blood pressure" : "Vitals flagged at your visit",
        message: "Your midwife/nurse recorded a reading that needs follow-up. They will reach out if needed.",
        relatedId: visit.id,
        relatedType: "Visit",
      },
    });
  }

  return NextResponse.json({ visit });
}
