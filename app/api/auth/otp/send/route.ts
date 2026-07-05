import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { sendOtpSms } from "@/lib/hubtel";
import { otpSendSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = otpSendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone } = parsed.data;
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  const existing = await prisma.user.findUnique({ where: { phone } });

  if (existing?.isActive) {
    // Already a fully verified account (mother or self-registered staff
    // mid-OTP-verification both leave isActive false until verified, so this
    // only blocks phones that have actually completed onboarding before).
    return NextResponse.json(
      { error: "This phone number already has an account. Please log in instead." },
      { status: 409 }
    );
  }

  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { otp, otpExpiry } });
  } else {
    await prisma.user.create({
      data: { phone, name: "New Mother", role: "MOTHER", isActive: false, otp, otpExpiry },
    });
  }

  await sendOtpSms(phone, otp);

  return NextResponse.json({ message: "OTP sent." });
}
