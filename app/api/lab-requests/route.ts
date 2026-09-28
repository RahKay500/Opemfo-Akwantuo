import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createLabRequestSchema } from "@/lib/validations/lab-requests";
import { getDoctorPatientDetail } from "@/lib/queries/doctor-patient-detail";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || (session.role !== "MIDWIFE" && session.role !== "DOCTOR")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createLabRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patientId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  if (session.role === "MIDWIFE") {
    if (patient.facilityId !== session.facilityId) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }
  } else {
    const detail = await getDoctorPatientDetail(patient.id, session.userId);
    if (!detail) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }
  }

  const labRequest = await prisma.labRequest.create({
    data: {
      patientId: patient.id,
      facilityId: patient.facilityId,
      requestedById: session.userId,
      testType: parsed.data.testType,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "LAB_REQUEST_CREATED",
    entityType: "LabRequest",
    entityId: labRequest.id,
    metadata: { patientId: patient.id, testType: labRequest.testType },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ labRequest });
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const mine = new URL(request.url).searchParams.get("mine") === "1";

  if (mine) {
    const labRequests = await prisma.labRequest.findMany({
      where: { requestedById: session.userId },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { requestedAt: "desc" },
    });
    return NextResponse.json({ labRequests });
  }

  if (session.role !== "LAB_TECHNICIAN" || !session.facilityId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const labRequests = await prisma.labRequest.findMany({
    where: { facilityId: session.facilityId },
    include: { patient: { select: { id: true, name: true } }, requestedBy: { select: { name: true, role: true } } },
    orderBy: { requestedAt: "desc" },
  });
  return NextResponse.json({ labRequests });
}
