import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createPatientSchema } from "@/lib/validations/patients";
import { sendPatientRegisteredSms } from "@/lib/hubtel";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const patients = await prisma.patient.findMany({
    where: { facilityId: session.facilityId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ patients });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  const lmp = parsed.data.lmp ? new Date(parsed.data.lmp) : null;
  const edd = lmp ? new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000) : null;

  const patient = await prisma.patient.create({
    data: {
      name: parsed.data.name,
      phone,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      ghanaCardId: parsed.data.ghanaCardId || null,
      facilityId: session.facilityId,
      registeredById: session.userId,
      lmp,
      edd,
      gravida: parsed.data.gravida,
      para: parsed.data.para,
      bloodGroup: parsed.data.bloodGroup || null,
      knownConditions: parsed.data.knownConditions || null,
      emergencyContactName: parsed.data.emergencyContactName || null,
      emergencyContactPhone: parsed.data.emergencyContactPhone
        ? normalizeGhanaPhone(parsed.data.emergencyContactPhone) ?? parsed.data.emergencyContactPhone
        : null,
      emergencyContactRelation: parsed.data.emergencyContactRelation || null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "PATIENT_REGISTERED",
    entityType: "Patient",
    entityId: patient.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await sendPatientRegisteredSms(phone);

  return NextResponse.json({ patient });
}
