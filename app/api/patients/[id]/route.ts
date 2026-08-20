import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createPatientSchema } from "@/lib/validations/patients";
import { calculateEdd, calculateEffectiveLmpFromScan } from "@/lib/pregnancy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

// The midwife who registered a patient is the one who can mistype a phone
// number, pick the wrong marital status, etc. — this lets her go back and
// correct any of the same fields captured at registration. Not exposed to
// Doctor (view-only) or Mother (edits only her own subset via /api/mother/profile).
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing || existing.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
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

  // A changed phone must not collide with a different mother/staff account —
  // matching the same uniqueness the User table enforces at registration.
  if (phone !== existing.phone) {
    const phoneOwner = await prisma.user.findUnique({ where: { phone } });
    if (phoneOwner && phoneOwner.id !== existing.userId) {
      return NextResponse.json({ error: "This phone number is already registered to someone else." }, { status: 409 });
    }
  }

  const scanDate = parsed.data.scanDate ? new Date(parsed.data.scanDate) : null;
  const lmp =
    parsed.data.datingMethod === "ULTRASOUND" && scanDate
      ? calculateEffectiveLmpFromScan(
          scanDate,
          parsed.data.gestationalAgeAtScanWeeks ?? 0,
          parsed.data.gestationalAgeAtScanDays ?? 0
        )
      : parsed.data.lmp
        ? new Date(parsed.data.lmp)
        : null;
  const edd = lmp ? calculateEdd(lmp) : null;
  const datingMethod = lmp ? (parsed.data.datingMethod ?? "LMP") : null;

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      ghanaCardId: parsed.data.ghanaCardId || null,
      lmp,
      edd,
      datingMethod,
      scanDate: parsed.data.datingMethod === "ULTRASOUND" ? scanDate : null,
      gravida: parsed.data.gravida,
      para: parsed.data.para,
      bloodGroup: parsed.data.bloodGroup || null,
      knownConditions: parsed.data.knownConditions || null,
      emergencyContactName: parsed.data.emergencyContactName || null,
      emergencyContactPhone: parsed.data.emergencyContactPhone
        ? normalizeGhanaPhone(parsed.data.emergencyContactPhone) ?? parsed.data.emergencyContactPhone
        : null,
      emergencyContactRelation: parsed.data.emergencyContactRelation || null,
      community: parsed.data.community || null,
      nhisNumber: parsed.data.nhisNumber || null,
      maritalStatus: parsed.data.maritalStatus || null,
      educationalLevel: parsed.data.educationalLevel || null,
      occupation: parsed.data.occupation || null,
      spouseName: parsed.data.spouseName || null,
      spousePhone: parsed.data.spousePhone
        ? normalizeGhanaPhone(parsed.data.spousePhone) ?? parsed.data.spousePhone
        : null,
      spouseOccupation: parsed.data.spouseOccupation || null,
      emergencyTransportPhone: parsed.data.emergencyTransportPhone
        ? normalizeGhanaPhone(parsed.data.emergencyTransportPhone) ?? parsed.data.emergencyTransportPhone
        : null,
    },
  });

  // Keep the linked mother login account's phone in sync — her login is
  // matched by phone, so leaving it stale would lock her out after a
  // midwife-side correction.
  if (existing.userId && phone !== existing.phone) {
    await prisma.user.update({ where: { id: existing.userId }, data: { phone } });
  }

  await logAudit({
    actorId: session.userId,
    action: "PATIENT_UPDATED",
    entityType: "Patient",
    entityId: patient.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ patient });
}
