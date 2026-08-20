import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, generateOtp } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createPatientSchema } from "@/lib/validations/patients";
import { sendMotherActivationSms } from "@/lib/hubtel";
import { calculateEdd, calculateEffectiveLmpFromScan } from "@/lib/pregnancy";

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

  // Mirrors how the Super Admin provisions staff: registering a patient here
  // is also what creates (or links) her own login account — she never
  // self-registers from scratch, only activates via OTP afterwards.
  const existingUser = await prisma.user.findUnique({ where: { phone } });
  let linkedUserId: string | null = null;

  if (existingUser?.isActive) {
    // Already using the app from a previous pregnancy/registration — link
    // immediately, no fresh activation needed.
    linkedUserId = existingUser.id;
  }

  const patient = await prisma.patient.create({
    data: {
      name: parsed.data.name,
      phone,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      ghanaCardId: parsed.data.ghanaCardId || null,
      facilityId: session.facilityId,
      registeredById: session.userId,
      userId: linkedUserId,
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
      numberOfAbortionsSpontaneous: parsed.data.numberOfAbortionsSpontaneous,
      numberOfAbortionsInduced: parsed.data.numberOfAbortionsInduced,
      majorRiskFactors: parsed.data.majorRiskFactors ?? [],
      previousPregnancies: parsed.data.previousPregnancies,
      height: parsed.data.height,
      weightAtAnc1: parsed.data.weightAtAnc1,
      bmiAtAnc1: parsed.data.bmiAtAnc1,
      estimatedDesiredWeightAtEdd: parsed.data.estimatedDesiredWeightAtEdd || null,
      contraceptionUsed: parsed.data.contraceptionUsed || null,
      rhTyping: parsed.data.rhTyping || null,
      hbsAg: parsed.data.hbsAg || null,
      sickling: parsed.data.sickling || null,
      g6pd: parsed.data.g6pd || null,
      vdrl: parsed.data.vdrl || null,
      hivStatus: parsed.data.hivStatus || null,
      hbFirstVisit: parsed.data.hbFirstVisit,
      urineRE: parsed.data.urineRE || null,
      stoolRE: parsed.data.stoolRE || null,
      bfForMalaria: parsed.data.bfForMalaria || null,
      medicalHistory: parsed.data.medicalHistory,
      socialHistory: parsed.data.socialHistory,
      familyHistory: parsed.data.familyHistory,
      physicalExamAtFirstVisit: parsed.data.physicalExamAtFirstVisit,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "PATIENT_REGISTERED",
    entityType: "Patient",
    entityId: patient.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (!existingUser) {
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60_000);
    await prisma.user.create({
      data: { name: parsed.data.name, phone, role: "MOTHER", isActive: false, otp, otpExpiry },
    });
    await sendMotherActivationSms(phone, otp);
  } else if (!existingUser.isActive) {
    // A prior pending activation (e.g. registered once before, never
    // activated) — refresh the code rather than leaving the old one live.
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60_000);
    await prisma.user.update({ where: { id: existingUser.id }, data: { otp, otpExpiry } });
    await sendMotherActivationSms(phone, otp);
  }

  return NextResponse.json({ patient });
}
