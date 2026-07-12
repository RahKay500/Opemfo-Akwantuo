import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, generateOtp } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createPatientSchema } from "@/lib/validations/patients";
import { sendMotherActivationSms } from "@/lib/hubtel";

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
