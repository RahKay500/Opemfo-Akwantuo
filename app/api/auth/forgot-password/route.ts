import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { sendOtpSms } from "@/lib/hubtel";
import { forgotPasswordSchema } from "@/lib/validations/auth";

// Reuses the same otp/verify + set-password routes as onboarding — verifying
// an OTP and setting a new password is identical either way. This route just
// gates who gets an OTP: an existing account only, not a brand-new phone.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone } = parsed.data;
  const user = await prisma.user.findUnique({ where: { phone } });

  // Same response whether or not the account exists, so this can't be used
  // to enumerate registered phone numbers.
  if (user && user.passwordHash && user.isActive) {
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60_000);
    await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpiry } });
    await sendOtpSms(phone, otp);
  }

  return NextResponse.json({ message: "If that number is registered, a reset code has been sent." });
}
