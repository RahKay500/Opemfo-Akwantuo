import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashPassword } from "@/lib/auth";
import { sendOtpSms } from "@/lib/hubtel";
import { registerSchema } from "@/lib/validations/auth";

// Self-service registration for MIDWIFE/DOCTOR staff (per Figma's CreateAccountScreen —
// there is no admin portal in this app to provision staff accounts otherwise).
// This only stages the account and sends an OTP; the phone number isn't proven
// to belong to the registrant, and the account isn't activated, until
// otp/verify + set-password (with no password body) complete the flow.
// facilityId is left null here — assigning a facility to a self-registered
// staff account isn't covered by the current screens and needs a follow-up
// decision.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, role, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing?.isActive) {
    return NextResponse.json(
      { error: "This phone number already has an account. Please log in instead." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  if (existing) {
    // Picking up an abandoned registration that never got OTP-verified.
    await prisma.user.update({
      where: { id: existing.id },
      data: { name, role, passwordHash, otp, otpExpiry },
    });
  } else {
    await prisma.user.create({
      data: { name, phone, role, passwordHash, isActive: false, otp, otpExpiry },
    });
  }

  await sendOtpSms(phone, otp);

  return NextResponse.json({ phone });
}
